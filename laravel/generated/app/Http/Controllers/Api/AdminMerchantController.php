<?php

namespace App\Http\Controllers\Api;

use App\Models\Merchant;
use Illuminate\Http\Request;

class AdminMerchantController extends PosApiController
{
    public function index(Request $request)
    {
        $status = $request->query('status', 'pending');

        $merchants = Merchant::query()
            ->with(['profile', 'modules'])
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate((int) $request->query('per_page', 20));

        return response()->json($merchants);
    }

    public function verify(Request $request, Merchant $merchant)
    {
        $data = $request->validate([
            'status' => ['required', 'in:active,rejected'],
            'verification_note' => ['nullable', 'string', 'max:500'],
        ]);

        $merchant->update([
            'status' => $data['status'],
        ]);

        return response()->json([
            'message' => $data['status'] === 'active'
                ? 'Merchant approved.'
                : 'Merchant rejected.',
            'data' => $merchant->fresh(['profile', 'modules']),
        ]);
    }
}
