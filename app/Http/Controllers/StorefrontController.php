<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderShipping;
use App\Models\StockLog;
use App\Models\Setting;
use App\Models\Coupon;
use App\Services\RajaOngkirService;
use App\Services\GineeService;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class StorefrontController extends Controller
{
    protected RajaOngkirService $rajaOngkir;
    protected GineeService $gineeService;
    protected PaymentService $paymentService;

    public function __construct(
        RajaOngkirService $rajaOngkir,
        GineeService $gineeService,
        PaymentService $paymentService
    ) {
        $this->rajaOngkir     = $rajaOngkir;
        $this->gineeService   = $gineeService;
        $this->paymentService = $paymentService;
    }

    /**
     * Halaman Pesanan Saya — daftar semua pesanan user yang login
     * GET /my-orders
     */
    public function myOrders(Request $request): Response
    {
        $userId = auth()->id();

        $orders = Order::with(['items', 'shipping'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Storefront/MyOrders', [
            'orders' => $orders,
        ]);
    }

    /**
     * Detail satu pesanan
     * GET /my-orders/{order}
     */
    public function orderDetail(Order $order): Response
    {
        // Pastikan hanya pemilik order yang bisa lihat
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Akses ditolak.');
        }

        // Proactive sync dari Midtrans jika belum terbayar
        if ($order->payment_status !== 'paid' && $order->payment_method !== 'manual_transfer') {
            $this->syncMidtransStatus($order);
            $order->refresh();
        }

        $order->load(['items', 'shipping', 'bankAccount']);

        return Inertia::render('Storefront/OrderDetail', [
            'order'             => $order,
            'midtransClientKey' => config('services.midtrans.client_key', ''),
            'midtransSnapUrl'   => config('services.midtrans.snap_url'),
        ]);
    }

    /**
     * Track Waybill status for an order
     * GET /my-orders/{order}/tracking
     */
    public function trackOrder(Order $order): JsonResponse
    {
        // Pastikan hanya pemilik order yang bisa melihat
        if ($order->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak.'
            ], 403);
        }

        $order->load('shipping');
        $shipping = $order->shipping;

        if (!$shipping || !$shipping->tracking_number) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor resi belum tersedia untuk pesanan ini.'
            ], 400);
        }

        $waybill = $shipping->tracking_number;
        $courier = strtolower($shipping->courier ?? 'jne');

        // Panggil RajaOngkir Service
        $trackingData = $this->rajaOngkir->trackWaybill($waybill, $courier);

        // Komerce/Rajaongkir response check
        $hasRealHistory = !empty($trackingData['history']) || !empty($trackingData['manifest']) || !empty($trackingData['details']);

        if (!$hasRealHistory) {
            // Generate mock timeline dates based on order timestamps for local testing / fallback
            $orderCreated = $order->created_at;
            $shippedTime = $shipping->updated_at ? \Carbon\Carbon::parse($shipping->updated_at) : $orderCreated->addHours(12);
            
            $mockHistory = [
                [
                    'date' => $shippedTime->translatedFormat('d M Y'),
                    'time' => $shippedTime->format('H:i'),
                    'description' => 'Paket telah diserahkan ke kurir (' . strtoupper($courier) . ') dan sedang dalam perjalanan.',
                    'location' => $shipping->city ?? 'Jakarta',
                ],
                [
                    'date' => $orderCreated->addHours(2)->translatedFormat('d M Y'),
                    'time' => $orderCreated->addHours(2)->format('H:i'),
                    'description' => 'Pesanan siap dikirim dan sedang menunggu pickup kurir',
                    'location' => 'Gudang Utama iLOOK',
                ],
                [
                    'date' => $orderCreated->translatedFormat('d M Y'),
                    'time' => $orderCreated->format('H:i'),
                    'description' => 'Pesanan berhasil dibuat dan dikonfirmasi',
                    'location' => 'Sistem iLOOK',
                ]
            ];

            // If order status is delivered or completed, add a delivered step
            if (in_array($order->status, ['delivered', 'completed'])) {
                $deliveredTime = $shipping->updated_at ? \Carbon\Carbon::parse($shipping->updated_at)->addDays(1) : $orderCreated->addDays(2);
                array_unshift($mockHistory, [
                    'date' => $deliveredTime->translatedFormat('d M Y'),
                    'time' => $deliveredTime->format('H:i'),
                    'description' => 'Pesanan telah diterima oleh penerima (' . $shipping->recipient_name . '). Terima kasih telah berbelanja di iLOOK.',
                    'location' => $shipping->city,
                ]);
            }

            $trackingData = [
                'summary' => [
                    'waybill_number' => $waybill,
                    'courier_name' => strtoupper($courier),
                    'status' => in_array($order->status, ['delivered', 'completed']) ? 'DELIVERED' : 'ON-PROCESS',
                    'receiver' => $shipping->recipient_name,
                ],
                'history' => $mockHistory,
                'is_mock' => true,
            ];
        } else {
            // Normalise the history key if it comes as "manifest" or "details"
            $history = $trackingData['history'] ?? $trackingData['manifest'] ?? [];
            
            // Format to standard format for frontend: array of { date, time, description, location }
            $formattedHistory = [];
            foreach ($history as $h) {
                // Parse date
                $dateStr = $h['manifest_date'] ?? $h['date'] ?? $h['dateTime'] ?? $h['time'] ?? '';
                if ($dateStr && preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateStr)) {
                    $dateStr = \Carbon\Carbon::parse($dateStr)->translatedFormat('d M Y');
                }

                // Parse time
                $timeStr = $h['manifest_time'] ?? $h['time'] ?? '';
                if ($timeStr && preg_match('/^\d{2}:\d{2}:\d{2}$/', $timeStr)) {
                    $timeStr = \Carbon\Carbon::parse($timeStr)->format('H:i');
                }

                $formattedHistory[] = [
                    'date' => $dateStr,
                    'time' => $timeStr,
                    'description' => $h['manifest_description'] ?? $h['description'] ?? $h['note'] ?? $h['desc'] ?? '',
                    'location' => $h['city_name'] ?? $h['location'] ?? $h['city'] ?? '',
                ];
            }

            $trackingData['history'] = $formattedHistory;
            $trackingData['is_mock'] = false;
        }

        return response()->json([
            'success' => true,
            'data' => $trackingData,
        ]);
    }

    /**
     * Storefront Homepage
     */
    public function home(Request $request): Response
    {
        $query = Product::with(['category', 'variants'])->where('status', 'active');
        
        if ($request->input('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->input('category'));
            });
        }

        if ($request->input('search')) {
            $query->where('name', 'like', '%' . $request->input('search') . '%');
        }

        $products = $query->orderBy('created_at', 'desc')->get();
        $categories = Category::withCount('products')->get();

        return Inertia::render('Storefront/Home', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category', 'search']),
        ]);
    }

    /**
     * Product Detail Page
     */
    public function productDetail(string $slug): Response
    {
        $product = Product::with(['category', 'variants', 'reviews' => function($q) {
            $q->orderBy('review_date', 'desc')->orderBy('created_at', 'desc');
        }])
            ->where('slug', $slug)
            ->firstOrFail();

        // Get origin city setting
        $originCityId = Setting::where('key', 'origin_city_id')->first()->value ?? '152';
        $originCityName = Setting::where('key', 'origin_city_name')->first()->value ?? 'Jakarta Barat';

        // Get whatsapp number
        $whatsappNumber = Setting::where('key', 'whatsapp_number')->first()->value ?? '081234567890';
        $whatsappNumber = preg_replace('/[^0-9]/', '', $whatsappNumber);
        if (str_starts_with($whatsappNumber, '0')) {
            $whatsappNumber = '62' . substr($whatsappNumber, 1);
        }

        // Load 4 related products in same category
        $related = Product::with(['category', 'variants'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('status', 'active')
            ->limit(4)
            ->get();

        return Inertia::render('Storefront/ProductDetail', [
            'product' => $product,
            'related' => $related,
            'origin' => [
                'city_id' => $originCityId,
                'city_name' => $originCityName,
            ],
            'whatsappNumber' => $whatsappNumber,
        ]);
    }

    /**
     * Cart Page
     */
    public function cart(): Response
    {
        return Inertia::render('Storefront/Cart');
    }

    /**
     * Checkout Page
     */
    public function checkoutPage(): Response
    {
        $provinces = $this->rajaOngkir->getProvinces();
        
        // Load active settings
        $settingsRaw = Setting::all()->pluck('value', 'key')->toArray();
        
        $activeCouriers = isset($settingsRaw['couriers_active']) 
            ? json_decode($settingsRaw['couriers_active'], true) 
            : ['jne', 'jnt', 'sicepat'];

        return Inertia::render('Storefront/Checkout', [
            'provinces'       => $provinces,
            'activeCouriers'  => $activeCouriers,
            'originCityId'    => $settingsRaw['origin_city_id'] ?? '152',
            'midtransClientKey' => config('services.midtrans.client_key', ''),
            'midtransSnapUrl'   => config('services.midtrans.snap_url'),
            'bankAccounts'    => \App\Models\BankAccount::where('is_active', true)->get(),
        ]);
    }

    /**
     * Calculate Shipping Cost API
     */
    public function calculateShipping(Request $request): JsonResponse
    {
        $request->validate([
            'destination_city_id' => 'required|integer',
            'weight' => 'required|integer|min:1',
            'courier' => 'required|string',
        ]);

        $originCityId = (int)(Setting::where('key', 'origin_city_id')->first()->value ?? 152);

        $costs = $this->rajaOngkir->calculateCost(
            $originCityId,
            $request->input('destination_city_id'),
            $request->input('weight'),
            $request->input('courier')
        );

        return response()->json([
            'success' => true,
            'costs' => $costs,
        ]);
    }

    /**
     * Get Cities by Province ID
     */
    public function getCities(int $provinceId): JsonResponse
    {
        $cities = $this->rajaOngkir->getCitiesByProvince($provinceId);
        return response()->json([
            'success' => true,
            'cities' => $cities,
        ]);
    }

    /**
     * Place Order and Sync to Ginee
     */
    public function placeOrder(Request $request): JsonResponse
    {
        $request->validate([
            'buyer_name' => 'required|string|max:255',
            'buyer_email' => 'required|email|max:255',
            'buyer_phone' => 'required|string|max:20',
            'address' => 'required|string',
            'province_id' => 'required|integer',
            'province_name' => 'required|string',
            'city_id' => 'required|integer',
            'city_name' => 'required|string',
            'courier' => 'required|string',
            'shipping_service' => 'required|string',
            'shipping_cost' => 'required|numeric|min:0',
            'weight' => 'required|integer|min:1',
            'coupon_code' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string|in:midtrans,manual_transfer',
            'bank_account_id' => 'nullable|required_if:payment_method,manual_transfer|exists:bank_accounts,id',
        ]);

        try {
            $order = DB::transaction(function () use ($request) {
                // Generate unique order number
                $orderNumber = 'ILK-' . date('YmdHis') . '-' . rand(1000, 9999);
                
                // Calculate item totals
                $subtotal = 0;
                $itemsToCreate = [];
                
                foreach ($request->input('items') as $cartItem) {
                    $variant = ProductVariant::with('product')->lockForUpdate()->find($cartItem['variant_id']);
                    
                    if ($variant->stock < $cartItem['quantity']) {
                        throw new \Exception("Stok tidak mencukupi untuk varian: {$variant->product->name} ({$variant->name})");
                    }

                    $unitPrice = $variant->price ?? $variant->product->base_price;
                    if ($variant->product->is_flash_sale_active) {
                        $flashSale = $variant->product->flashSale;
                        if ($flashSale->discount_type === 'percentage') {
                            $unitPrice = max(0, $unitPrice * (1 - ($flashSale->discount_value / 100)));
                        } else {
                            $unitPrice = max(0, $unitPrice - $flashSale->discount_value);
                        }
                    }
                    $totalPrice = $unitPrice * $cartItem['quantity'];
                    $subtotal += $totalPrice;

                    // Deduct local stock
                    $oldStock = $variant->stock;
                    $variant->update([
                        'stock' => $oldStock - $cartItem['quantity']
                    ]);

                    // Log stock change
                    StockLog::create([
                        'product_variant_id' => $variant->id,
                        'before' => $oldStock,
                        'after' => $variant->stock,
                        'reason' => 'storefront_purchase',
                    ]);

                    $itemsToCreate[] = [
                        'product_variant_id' => $variant->id,           // FK ke product_variants
                        'product_name'       => $variant->product->name,
                        'variant_label'      => $variant->name,         // kolom variant_label
                        'quantity'           => $cartItem['quantity'],
                        'unit_price'         => $unitPrice,
                        'subtotal'           => $totalPrice,            // kolom subtotal
                        '_ginee_variant_id'  => $variant->ginee_variant_id, // prefix _ agar tidak diinsert
                    ];
                }

                // Coupon calculation
                $couponCode = $request->input('coupon_code') ? strtoupper(trim($request->input('coupon_code'))) : null;
                $couponDiscount = 0.00;

                if ($couponCode) {
                    // Check if any item in the order is in an active flash sale
                    foreach ($request->input('items') as $cartItem) {
                        $v = ProductVariant::with('product')->find($cartItem['variant_id']);
                        if ($v && $v->product && $v->product->is_flash_sale_active) {
                            throw new \Exception("Kupon diskon tidak dapat digunakan karena terdapat produk Flash Sale di keranjang belanja Anda.");
                        }
                    }

                    $coupon = Coupon::where('code', $couponCode)->first();
                    if ($coupon) {
                        if (!$coupon->isValidForSubtotal($subtotal)) {
                            throw new \Exception("Kupon tidak valid untuk transaksi ini.");
                        }
                        $couponDiscount = $coupon->calculateDiscount($subtotal);
                    } else {
                        throw new \Exception("Kupon tidak ditemukan.");
                    }
                }

                $shippingCost = $request->input('shipping_cost');
                $totalAmount = max(0, $subtotal + $shippingCost - $couponDiscount);

                // Create Order record — status awal pending_payment, akan diupdate setelah Midtrans callback
                $order = Order::create([
                    'order_number'   => $orderNumber,
                    'user_id'        => auth()->id() ?? (\App\Models\User::first()->id ?? 1),
                    'status'         => 'pending_payment',
                    'subtotal'       => $subtotal,
                    'shipping_cost'  => $shippingCost,
                    'total_amount'   => $totalAmount,
                    'payment_method' => $request->input('payment_method'),
                    'payment_status' => 'unpaid',
                    'coupon_code'    => $couponCode,
                    'coupon_discount' => $couponDiscount,
                    'bank_account_id' => $request->input('bank_account_id'),
                ]);

                // Create Order Items
                foreach ($itemsToCreate as $itemData) {
                    $itemData['order_id'] = $order->id;
                    unset($itemData['_ginee_variant_id']); // hapus field non-schema sebelum insert

                    OrderItem::create($itemData);
                }

                // Create Order Shipping
                OrderShipping::create([
                    'order_id' => $order->id,
                    'courier' => $request->input('courier'),
                    'service' => $request->input('shipping_service'),
                    'courier_name' => strtoupper($request->input('courier')),
                    'tracking_number' => null,
                    'rajaongkir_city_id' => $request->input('city_id'),
                    'recipient_name' => $request->input('buyer_name'),
                    'phone' => $request->input('buyer_phone'),
                    'address' => $request->input('address'),
                    'city' => $request->input('city_name'),
                    'province' => $request->input('province_name'),
                    'postal_code' => $request->input('postal_code', '12345'),
                ]);

                return $order;
            });

            // Setelah order dibuat dengan status pending_payment,
            // Frontend akan memanggil /orders/{id}/payment/initiate untuk mendapat snap_token
            // Ginee push akan dilakukan setelah webhook Midtrans diterima (status = paid)

            return response()->json([
                'success'      => true,
                'order_id'     => $order->id,
                'order_number' => $order->order_number,
                'total_amount' => $order->total_amount,
            ]);

        } catch (\Exception $e) {
            Log::error('Checkout placement error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Initiate Midtrans Payment — Buat Snap Token untuk order yang sudah dibuat
     * 
     * POST /orders/{order}/payment/initiate
     */
    public function initiatePayment(Order $order): JsonResponse
    {
        // Pastikan order masih pending_payment
        if ($order->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan ini sudah terbayar.',
            ], 400);
        }

        try {
            $snapToken = $this->paymentService->createSnapToken($order);

            return response()->json([
                'success'    => true,
                'snap_token' => $snapToken,
                'order_id'   => $order->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Midtrans createSnapToken error: ' . $e->getMessage(), [
                'order_number' => $order->order_number,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menginisiasi pembayaran: ' . $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Order Success Screen
     * Saat user redirect ke sini setelah bayar, cek status ke Midtrans dan update order
     */
    public function orderSuccess(Order $order): Response
    {
        $order->load(['items', 'shipping', 'bankAccount']);

        // Proactive status check: sync dari Midtrans jika order masih belum terbayar di DB
        if ($order->payment_status !== 'paid' && $order->payment_method !== 'manual_transfer') {
            $this->syncMidtransStatus($order);
            $order->refresh();
        }

        return Inertia::render('Storefront/OrderSuccess', [
            'order' => $order
        ]);
    }

    /**
     * Order Pending Payment Screen
     */
    public function orderPending(Order $order): Response|\Illuminate\Http\RedirectResponse
    {
        $order->load(['items', 'shipping', 'bankAccount']);

        // Cek status terbaru dari Midtrans setiap kali halaman ini dibuka
        if ($order->payment_status !== 'paid' && $order->payment_method !== 'manual_transfer') {
            $this->syncMidtransStatus($order);
            $order->refresh();
        }

        // Jika ternyata sudah terbayar, redirect ke halaman success
        if ($order->payment_status === 'paid') {
            return redirect()->route('storefront.order.success', $order->id);
        }

        $order->load(['items', 'shipping', 'bankAccount']);
        return Inertia::render('Storefront/OrderPending', [
            'order'             => $order,
            'midtransClientKey' => config('services.midtrans.client_key', ''),
            'midtransSnapUrl'   => config('services.midtrans.snap_url'),
        ]);
    }

    /**
     * API endpoint: cek status pembayaran dari Midtrans secara real-time
     * Dipanggil oleh frontend untuk polling status
     *
     * GET /orders/{order}/payment/status
     */
    public function checkPaymentStatus(Order $order): JsonResponse
    {
        if ($order->payment_method !== 'manual_transfer') {
            $this->syncMidtransStatus($order);
            $order->refresh();
        }

        return response()->json([
            'payment_status' => $order->payment_status,
            'status'         => $order->status,
            'payment_method' => $order->payment_method,
            'is_paid'        => $order->payment_status === 'paid',
        ]);
    }

    /**
     * Upload proof of payment for manual transfer orders
     */
    public function uploadPaymentProof(Request $request, Order $order): \Illuminate\Http\RedirectResponse
    {
        // Ensure owner
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Akses ditolak.');
        }

        if ($order->payment_method !== 'manual_transfer') {
            return back()->with('error', 'Pesanan ini tidak menggunakan metode transfer manual.');
        }

        if ($order->payment_status === 'paid') {
            return back()->with('error', 'Pesanan ini sudah lunas.');
        }

        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg,gif,svg,pdf|max:2048',
        ]);

        try {
            if ($request->hasFile('payment_proof')) {
                $file = $request->file('payment_proof');
                $filename = 'proof-' . $order->order_number . '-' . time() . '.' . $file->getClientOriginalExtension();
                
                // Ensure target directory exists in public/uploads/payment_proofs
                $targetDir = public_path('uploads/payment_proofs');
                if (!file_exists($targetDir)) {
                    mkdir($targetDir, 0755, true);
                }
                
                $file->move($targetDir, $filename);
                $filePath = '/uploads/payment_proofs/' . $filename;

                // Delete old proof if exists
                if ($order->payment_proof && file_exists(public_path($order->payment_proof))) {
                    @unlink(public_path($order->payment_proof));
                }

                $order->update([
                    'payment_proof' => $filePath,
                ]);

                return back()->with('success', 'Bukti transfer berhasil diunggah. Menunggu konfirmasi admin.');
            }
        } catch (\Exception $e) {
            Log::error('Upload payment proof error: ' . $e->getMessage());
            return back()->with('error', 'Gagal mengunggah bukti transfer: ' . $e->getMessage());
        }

        return back()->with('error', 'File tidak ditemukan.');
    }

    /**
     * Sinkronisasi status order dengan Midtrans Transaction Status API
     * Berguna sebagai fallback ketika webhook tidak diterima (development / localhost)
     */
    private function syncMidtransStatus(Order $order): void
    {
        try {
            $statusData = $this->paymentService->checkTransactionStatus($order->order_number);

            if (!$statusData) return;

            $transactionStatus = $statusData['transaction_status'] ?? '';
            $fraudStatus       = $statusData['fraud_status'] ?? '';
            $paymentType       = $statusData['payment_type'] ?? '';

            if ($transactionStatus === 'settlement' ||
                ($transactionStatus === 'capture' && $fraudStatus === 'accept')) {

                if ($order->payment_status !== 'paid') {
                    $order->update([
                        'status'         => 'paid',
                        'payment_status' => 'paid',
                        'payment_method' => $this->resolvePaymentLabel($paymentType, $statusData),
                    ]);

                    Log::info('Order status synced from Midtrans API', [
                        'order_number'       => $order->order_number,
                        'transaction_status' => $transactionStatus,
                    ]);

                    // Push ke Ginee jika belum
                    if (empty($order->ginee_order_id)) {
                        $this->pushPaidOrderToGinee($order);
                    }
                }

            } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire', 'failure'])) {
                $order->update([
                    'status'         => 'cancelled',
                    'payment_status' => 'failed',
                ]);
            }

        } catch (\Exception $e) {
            Log::warning('syncMidtransStatus error: ' . $e->getMessage(), [
                'order_number' => $order->order_number,
            ]);
        }
    }

    /**
     * Format nama metode pembayaran dari Midtrans response
     */
    private function resolvePaymentLabel(string $type, array $data): string
    {
        $bank = $data['va_numbers'][0]['bank'] ?? ($data['bank'] ?? '');
        return match ($type) {
            'bank_transfer' => 'Virtual Account ' . strtoupper($bank),
            'gopay'         => 'GoPay',
            'qris'          => 'QRIS',
            'shopeepay'     => 'ShopeePay',
            'credit_card'   => 'Kartu Kredit/Debit',
            'cstore'        => 'Gerai Ritel (' . strtoupper($data['store'] ?? '') . ')',
            default         => ucfirst(str_replace('_', ' ', $type)),
        };
    }

    /**
     * Push order yang sudah terbayar ke Ginee OMS
     */
    private function pushPaidOrderToGinee(Order $order): void
    {
        try {
            $order->load(['items', 'shipping']);

            $shops      = $this->gineeService->getShops();
            $warehouses = $this->gineeService->getWarehouses();

            $shopId      = $shops['content'][0]['shopId'] ?? ($shops[0]['shopId'] ?? 'sp-mock-1001');
            $warehouseId = $warehouses['content'][0]['id'] ?? ($warehouses[0]['id'] ?? 'wh-mock-1001');

            $gineeOrderItems = $order->items->map(fn($item) => [
                'sku'         => $item->variant?->sku ?? $item->product_name,
                'quantity'    => $item->quantity,
                'actualPrice' => $item->unit_price,
                'warehouseId' => $warehouseId,
            ])->toArray();

            $gineePayload = [
                'externalOrderSn' => $order->order_number,
                'shopId'          => $shopId,
                'customerName'    => $order->shipping?->recipient_name ?? '',
                'customerEmail'   => $order->user?->email ?? '',
                'customerMobile'  => $order->shipping?->phone ?? '',
                'paymentMethod'   => 'PREPAY',
                'payAmount'       => $order->total_amount,
                'payAtDatetime'   => gmdate('Y-m-d\TH:i:s\Z'),
                'orderItems'      => $gineeOrderItems,
                'shippingAddress' => [
                    'name'          => $order->shipping?->recipient_name ?? '',
                    'phoneNumber'   => $order->shipping?->phone ?? '',
                    'country'       => 'ID',
                    'province'      => $order->shipping?->province ?? '',
                    'city'          => $order->shipping?->city ?? '',
                    'district'      => $order->shipping?->city ?? '',
                    'detailAddress' => $order->shipping?->address ?? '',
                ],
                'logisticsInfos'  => [[
                    'courierCode'    => strtoupper($order->shipping?->courier ?? ''),
                    'shippingMethod' => $order->shipping?->service ?? '',
                    'shippingFee'    => $order->shipping_cost,
                ]],
            ];

            $gineeResponse = $this->gineeService->createManualOrder($gineePayload);

            if ($gineeResponse && isset($gineeResponse['gineeOrderId'])) {
                $order->update(['ginee_order_id' => $gineeResponse['gineeOrderId']]);
                Log::info('Order pushed to Ginee after status sync', [
                    'order_number' => $order->order_number,
                    'ginee_id'     => $gineeResponse['gineeOrderId'],
                ]);
            }
        } catch (\Exception $e) {
            Log::error('pushPaidOrderToGinee error: ' . $e->getMessage());
        }
    }

    /**
     * Search destination cities/districts via RajaOngkir
     */
    public function searchDestination(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        if (strlen($query) < 3) {
            return response()->json([
                'success' => true,
                'destinations' => []
            ]);
        }

        $destinations = $this->rajaOngkir->searchDestination($query);

        return response()->json([
            'success' => true,
            'destinations' => $destinations
        ]);
    }

    /**
     * Validate and Apply Coupon API
     * POST /api/coupon/apply
     */
    public function applyCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
            'items' => 'nullable|array',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $code = strtoupper(trim($request->input('code')));
        $subtotal = (float) $request->input('subtotal');

        // Check if any item in the cart is in a flash sale
        if ($request->has('items') && is_array($request->input('items'))) {
            foreach ($request->input('items') as $item) {
                if (isset($item['variant_id'])) {
                    $variant = ProductVariant::with('product')->find($item['variant_id']);
                    if ($variant && $variant->product && $variant->product->is_flash_sale_active) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Kupon diskon tidak dapat digunakan karena terdapat produk Flash Sale di keranjang belanja Anda.',
                        ], 400);
                    }
                }
            }
        }

        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Kode kupon tidak ditemukan.',
            ], 404);
        }

        if (!$coupon->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Kupon ini sudah tidak aktif.',
            ], 400);
        }

        if ($coupon->expires_at && \Carbon\Carbon::now()->greaterThan($coupon->expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Kupon ini sudah kedaluwarsa.',
            ], 400);
        }

        if ($subtotal < $coupon->min_spend) {
            return response()->json([
                'success' => false,
                'message' => 'Minimal pembelanjaan untuk kupon ini adalah Rp' . number_format($coupon->min_spend, 0, ',', '.') . '.',
            ], 400);
        }

        $discount = $coupon->calculateDiscount($subtotal);

        return response()->json([
            'success' => true,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => $coupon->value,
            'discount_amount' => $discount,
            'message' => 'Kupon berhasil diterapkan.',
        ]);
    }
}

