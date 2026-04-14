@props(['url'])
@php($logoUrl = rtrim((string) config('app.url', 'http://localhost'), '/') . '/czm-email-logo.svg')
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
<img src="{{ $logoUrl }}" class="logo" alt="Czark Mak Corporation Logo" style="max-width: 220px; max-height: 80px;">
</a>
</td>
</tr>
