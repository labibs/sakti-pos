<?php

namespace App\Http\Controllers\Api;

use App\Models\Merchant;
use App\Models\MerchantModule;
use App\Models\MerchantProfile;
use App\Models\MerchantSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MerchantOnboardingController extends PosApiController
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'owner_email' => ['required', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:50'],
            'clerk_user_id' => ['required', 'string', 'max:150'],
            'business_type' => ['required', 'string', 'max:80'],
            'modules' => ['nullable', 'array'],
            'modules.*' => ['string', 'max:80'],
        ]);

        $merchant = DB::transaction(function () use ($data) {
            $merchant = Merchant::create([
                'name' => $data['name'],
                'business_type' => $this->normalizeBusinessType($data['business_type']),
                'status' => 'pending',
            ]);

            MerchantProfile::create([
                'merchant_id' => $merchant->id,
                'email' => $data['owner_email'],
                'phone' => $data['phone'] ?? null,
            ]);

            MerchantSetting::create([
                'merchant_id' => $merchant->id,
                'key' => 'onboarding.clerk_user_id',
                'value_json' => ['value' => $data['clerk_user_id']],
            ]);

            foreach (($data['modules'] ?? ['pos']) as $moduleCode) {
                MerchantModule::updateOrCreate(
                    ['merchant_id' => $merchant->id, 'module_code' => $moduleCode],
                    ['is_enabled' => true, 'config_json' => null]
                );
            }

            return $merchant->fresh(['profile', 'modules']);
        });

        return response()->json([
            'message' => 'Merchant registration submitted.',
            'data' => $merchant,
        ], 201);
    }

    private function normalizeBusinessType(string $type): string
    {
        return match ($type) {
            'restaurant' => 'restaurant_cafe',
            'workshop' => 'workshop_service',
            'fashion', 'pharmacy', 'service' => 'general_service',
            default => $type,
        };
    }
}
