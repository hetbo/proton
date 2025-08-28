<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SHELF by Hetbo</title>

    @viteReactRefresh
    @vite('resources/css/app.css')
    @vite('resources/js/shelf/shelf.tsx')
</head>
<body class="antialiased">
<div id="app"></div>
</body>
</html>
