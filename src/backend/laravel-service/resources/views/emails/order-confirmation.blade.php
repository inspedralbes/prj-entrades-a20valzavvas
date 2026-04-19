<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmació de la teva compra</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
        .wrapper { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { background: #0F0F23; padding: 32px 40px; text-align: center; }
        .header h1 { color: #CA8A04; font-size: 22px; margin: 0 0 4px; letter-spacing: 0.05em; text-transform: uppercase; }
        .header p { color: #94a3b8; font-size: 13px; margin: 0; }
        .body { padding: 32px 40px; }
        .greeting { font-size: 16px; color: #1e293b; margin: 0 0 24px; }
        .event-name { font-size: 20px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
        .event-meta { font-size: 14px; color: #64748b; margin: 0 0 24px; }
        .section-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { text-align: left; font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
        td { font-size: 14px; color: #334155; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .total-row td { border-bottom: none; border-top: 2px solid #e2e8f0; font-weight: 700; font-size: 16px; color: #1e293b; padding-top: 14px; }
        .total-amount { text-align: right; color: #CA8A04 !important; }
        .footer { background: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
        .footer p { font-size: 12px; color: #94a3b8; margin: 0; }
        .order-ref { display: inline-block; background: #f1f5f9; border-radius: 6px; padding: 4px 10px; font-size: 12px; color: #64748b; font-family: monospace; margin-top: 16px; }
    </style>
</head>
<body>
<div class="wrapper">
    <div class="header">
        <h1>Sala Onirica</h1>
        <p>Confirmació de compra</p>
    </div>
    <div class="body">
        <p class="greeting">Hola, <strong>{{ $order->user->name }}</strong>!</p>

        @php
            $firstEvent = $order->orderItems->first()?->seat?->event;
        @endphp

        @if($firstEvent)
            <p class="event-name">{{ $firstEvent->name }}</p>
            <p class="event-meta">
                {{ \Carbon\Carbon::parse($firstEvent->date)->locale('ca')->isoFormat('dddd, D MMMM YYYY · HH:mm') }}h
                &nbsp;·&nbsp;
                {{ $firstEvent->venue }}
            </p>
        @endif

        <p class="section-label">Seients</p>
        <table>
            <thead>
                <tr>
                    <th>Fila</th>
                    <th>Seient</th>
                    <th>Categoria</th>
                    <th style="text-align:right">Preu</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->orderItems as $item)
                    <tr>
                        <td>{{ $item->seat->row }}</td>
                        <td>{{ $item->seat->number }}</td>
                        <td>{{ $item->seat->priceCategory?->name ?? '—' }}</td>
                        <td style="text-align:right">{{ number_format((float)$item->price, 2, ',', '.') }} €</td>
                    </tr>
                @endforeach
            </tbody>
            <tfoot>
                <tr class="total-row">
                    <td colspan="3">Total</td>
                    <td class="total-amount">{{ number_format((float)$order->total_amount, 2, ',', '.') }} €</td>
                </tr>
            </tfoot>
        </table>

        <div class="order-ref">Ref: {{ $order->id }}</div>
    </div>
    <div class="footer">
        <p>Gràcies per la teva compra · Sala Onirica</p>
    </div>
</div>
</body>
</html>
