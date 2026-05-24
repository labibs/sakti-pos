<?php

namespace App\Http\Controllers\Api;

use App\Models\Merchant;
use App\Models\MerchantProfile;
use App\Models\MerchantSetting;
use Illuminate\Http\Request;

class MerchantController extends PosApiController
{
    public function current(Request $request)
    {
        return Merchant::with('profile')->findOrFail($this->merchantId($request));
    }

    public function updateProfile(Request $request)
    {
        $merchantId = $this->merchantId($request);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:150'],
            'business_type' => ['sometimes', 'in:restaurant_cafe,warung_retail,workshop_service,laundry,salon_appointment,ticketing,shipment_expedition,general_service'],
            'logo_url' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:150'],
            'address' => ['nullable', 'string'],
            'tax_number' => ['nullable', 'string', 'max:100'],
            'receipt_footer' => ['nullable', 'string', 'max:255'],
        ]);

        $merchant = Merchant::findOrFail($merchantId);
        $merchant->update(collect($data)->only(['name', 'business_type'])->toArray());

        MerchantProfile::updateOrCreate(
            ['merchant_id' => $merchantId],
            collect($data)->only(['logo_url', 'phone', 'email', 'address', 'tax_number', 'receipt_footer'])->toArray()
        );

        return $merchant->fresh('profile');
    }

    public function settings(Request $request)
    {
        return MerchantSetting::where('merchant_id', $this->merchantId($request))->get();
    }

    public function updateSettings(Request $request)
    {
        $merchantId = $this->merchantId($request);
        $data = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string', 'max:120'],
            'settings.*.value_json' => ['nullable', 'array'],
        ]);

        foreach ($data['settings'] as $setting) {
            MerchantSetting::updateOrCreate(
                ['merchant_id' => $merchantId, 'key' => $setting['key']],
                ['value_json' => $setting['value_json'] ?? null]
            );
        }

        return $this->settings($request);
    }
}
