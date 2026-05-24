<?php

namespace App\Http\Controllers\Api;

use App\Models\MerchantModule;
use App\Models\Module;
use Illuminate\Http\Request;

class MerchantModuleController extends PosApiController
{
    public function index(Request $request)
    {
        $merchantId = $this->merchantId($request);

        return response()->json([
            'available' => Module::orderBy('is_core', 'desc')->orderBy('name')->get(),
            'enabled' => MerchantModule::where('merchant_id', $merchantId)->get(),
        ]);
    }

    public function sync(Request $request)
    {
        $merchantId = $this->merchantId($request);
        $data = $request->validate([
            'modules' => ['required', 'array'],
            'modules.*.module_code' => ['required', 'string', 'exists:modules,code'],
            'modules.*.is_enabled' => ['required', 'boolean'],
            'modules.*.config_json' => ['nullable', 'array'],
        ]);

        foreach ($data['modules'] as $module) {
            MerchantModule::updateOrCreate(
                ['merchant_id' => $merchantId, 'module_code' => $module['module_code']],
                [
                    'is_enabled' => $module['is_enabled'],
                    'config_json' => $module['config_json'] ?? null,
                ]
            );
        }

        return response()->json(MerchantModule::where('merchant_id', $merchantId)->get());
    }
}
