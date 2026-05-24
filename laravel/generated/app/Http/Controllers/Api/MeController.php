<?php

namespace App\Http\Controllers\Api;

use App\Models\Merchant;
use App\Models\MerchantModule;
use Illuminate\Http\Request;

class MeController extends PosApiController
{
    public function __invoke(Request $request)
    {
        $merchantId = $this->merchantId($request);

        return response()->json([
            'user' => $request->user(),
            'merchant' => Merchant::with('profile')->find($merchantId),
            'modules' => MerchantModule::where('merchant_id', $merchantId)
                ->where('is_enabled', true)
                ->pluck('module_code'),
        ]);
    }
}
