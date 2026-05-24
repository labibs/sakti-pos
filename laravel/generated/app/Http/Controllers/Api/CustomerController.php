<?php

namespace App\Http\Controllers\Api;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends PosApiController
{
    public function index(Request $request)
    {
        $query = Customer::where('merchant_id', $this->merchantId($request));

        if ($request->filled('q')) {
            $search = $request->query('q');
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('name')->paginate((int) $request->query('per_page', 50));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);
        $data['merchant_id'] = $this->merchantId($request);

        return response()->json(Customer::create($data), 201);
    }

    public function show(Request $request, Customer $customer)
    {
        abort_unless($customer->merchant_id === $this->merchantId($request), 404);

        return $customer;
    }

    public function update(Request $request, Customer $customer)
    {
        abort_unless($customer->merchant_id === $this->merchantId($request), 404);
        $customer->update($request->validate([
            'name' => ['sometimes', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]));

        return $customer;
    }

    public function destroy(Request $request, Customer $customer)
    {
        abort_unless($customer->merchant_id === $this->merchantId($request), 404);
        $customer->delete();

        return response()->noContent();
    }
}
