<?php

namespace App\Http\Controllers\Api;

use App\Models\Document;
use App\Models\DocumentDelivery;
use Illuminate\Http\Request;

class DocumentController extends PosApiController
{
    public function show(Request $request, Document $document)
    {
        abort_unless($document->merchant_id === $this->merchantId($request), 404);

        return $document->load('deliveries');
    }

    public function text(Request $request, Document $document)
    {
        abort_unless($document->merchant_id === $this->merchantId($request), 404);

        return response($document->content_text ?? '', 200)
            ->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    public function sendWhatsApp(Request $request, Document $document)
    {
        abort_unless($document->merchant_id === $this->merchantId($request), 404);
        $data = $request->validate([
            'recipient' => ['required', 'string', 'max:180'],
        ]);

        $delivery = DocumentDelivery::create([
            'document_id' => $document->id,
            'channel' => 'whatsapp',
            'recipient' => $data['recipient'],
            'status' => 'pending',
        ]);

        // Integrasi provider WhatsApp bisa ditambahkan di sini.
        $delivery->update(['status' => 'sent', 'sent_at' => now()]);

        return $delivery;
    }

    public function sendEmail(Request $request, Document $document)
    {
        abort_unless($document->merchant_id === $this->merchantId($request), 404);
        $data = $request->validate([
            'recipient' => ['required', 'email', 'max:180'],
        ]);

        $delivery = DocumentDelivery::create([
            'document_id' => $document->id,
            'channel' => 'email',
            'recipient' => $data['recipient'],
            'status' => 'pending',
        ]);

        // Integrasi mailer/pdf bisa ditambahkan di sini.
        $delivery->update(['status' => 'sent', 'sent_at' => now()]);

        return $delivery;
    }

    public function printLog(Request $request, Document $document)
    {
        abort_unless($document->merchant_id === $this->merchantId($request), 404);

        return DocumentDelivery::create([
            'document_id' => $document->id,
            'channel' => 'print',
            'recipient' => $request->input('printer_name'),
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }
}
