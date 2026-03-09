<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
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

        AuditLog::log('create', 'position', $position->id, $position->title,
            "Created position '{$position->title}'");

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

        AuditLog::log('update', 'position', $position->id, $position->title,
            "Updated position '{$position->title}'");

        return $position;
    }

    public function destroy(Position $position)
    {
        $title = $position->title;
        $positionId = $position->id;

        $position->delete();

        AuditLog::log('delete', 'position', $positionId, $title,
            "Deleted position '{$title}'");

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
