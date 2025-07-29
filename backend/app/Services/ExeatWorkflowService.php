<?php

namespace App\Services;

use App\Models\ExeatRequest;
use App\Models\ExeatApproval;
use Illuminate\Support\Facades\Log;

class ExeatWorkflowService
{
    /**
     * Approve an exeat request for a given staff and approval step.
     */
    public function approve(ExeatRequest $exeatRequest, ExeatApproval $approval, $comment = null)
    {
        // Example: status transition logic (expand as needed for multi-stage)
        $exeatRequest->status = 'approved';
        $exeatRequest->save();
        $approval->status = 'approved';
        $approval->comment = $comment;
        $approval->save();
        Log::info('WorkflowService: Exeat approved', ['exeat_id' => $exeatRequest->id, 'approval_id' => $approval->id]);
        return $exeatRequest;
    }

    /**
     * Reject an exeat request for a given staff and approval step.
     */
    public function reject(ExeatRequest $exeatRequest, ExeatApproval $approval, $comment = null)
    {
        $exeatRequest->status = 'rejected';
        $exeatRequest->save();
        $approval->status = 'rejected';
        $approval->comment = $comment;
        $approval->save();
        Log::info('WorkflowService: Exeat rejected', ['exeat_id' => $exeatRequest->id, 'approval_id' => $approval->id]);
        return $exeatRequest;
    }

    // Add more workflow methods as needed (e.g., nextStage, sendParentConsent, etc.)
}