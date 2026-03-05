<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    public function index()
    {
        return Position::query()->latest()->paginate(20);
    }

    public function publicIndex()
    {
        return Position::query()
            ->where('is_active', true)
            ->orderBy('title')
            ->get();
    }

    public function all()
    {
        return Position::query()
            ->orderBy('title')
            ->get(['id', 'title']);
    }

    public function store(Request $request)
    {
        $data = $this->validatePosition($request);

        $position = Position::create($data);

        return response()->json($position, 201);
    }

    public function show(Position $position)
    {
        return $position;
    }

    public function update(Request $request, Position $position)
    {
        $data = $this->validatePosition($request, true);

        $position->update($data);

        return $position;
    }

    public function destroy(Position $position)
    {
        $position->delete();

        return response()->noContent();
    }

    private function validatePosition(Request $request, bool $isUpdate = false): array
    {
        $titleRules    = $isUpdate ? ['sometimes', 'required', 'string', 'max:255'] : ['required', 'string', 'max:255'];
        $locationRules = $isUpdate ? ['sometimes', 'required', 'string', 'max:255'] : ['required', 'string', 'max:255'];

        return $request->validate([
            'title'       => $titleRules,
            'description' => ['nullable', 'string', 'max:4000'],
            'location'    => $locationRules,
            'salary_min'  => ['nullable', 'numeric', 'min:0'],
            'salary_max'  => ['nullable', 'numeric', 'min:0'],
            'is_active'   => ['sometimes', 'boolean'],
        ]);
    }
}
