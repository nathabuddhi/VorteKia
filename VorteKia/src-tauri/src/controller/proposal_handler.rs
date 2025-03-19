use entity::proposal::{Entity as ProposalEntities, ActiveModel as ProposalActiveModel};
use sea_orm::{entity::prelude::*, EntityTrait, QueryFilter, Set};
use serde::{Deserialize, Serialize};
use tauri::{command, State};

use crate::{ApiResponse, AppState};

use super::ride_handler::SingleUidRequest;

#[derive(Serialize, Deserialize)]
pub struct ProposalObject {
    pub proposal_id: String,
    pub subject: String,
    pub content: String,
    pub status: String,
    pub response: String,
    pub recepient: String,
}

#[command]
pub async fn get_proposal_by_id(
    state: State<'_, AppState>,
    payload: SingleUidRequest,
) -> Result<ApiResponse<ProposalObject>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let proposal_found = ProposalEntities::find()
        .filter(<ProposalEntities as EntityTrait>::Column::ProposalId.eq(&payload.id))
        .one(&db)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    let proposal = match proposal_found {
        Some(proposal) => proposal,
        None => return Ok(ApiResponse::error(None, "Proposal not found.".to_string())),
    };

    let proposal_return = ProposalObject {
        proposal_id: proposal.proposal_id,
        subject: proposal.subject,
        content: proposal.content,
        status: proposal.status,
        response: proposal.response,
        recepient: proposal.recepient,
    };

    Ok(ApiResponse::success(
        proposal_return,
        "Successfully fetched proposal!".to_string(),
    ))
}

#[command]
pub async fn get_proposal_by_user(
    state: State<'_, AppState>,
    payload: SingleUidRequest
) -> Result<ApiResponse<Vec<ProposalObject>>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let proposals;

    if payload.id == "ceo" {
        proposals = ProposalEntities::find()
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;
    }
    else {
        proposals = ProposalEntities::find()
        .filter(<ProposalEntities as EntityTrait>::Column::Recepient.eq(payload.id))
        .all(&db)
        .await
        .map_err(|e| e.to_string())?;
    }
    
    let mut proposal_returns = Vec::new();

    for proposal in proposals {
        let proposal_request: Result<ApiResponse<ProposalObject>, _> = get_proposal_by_id(state.clone(), SingleUidRequest { id: proposal.proposal_id }).await;

        let proposal_object = match proposal_request {
            Ok(ApiResponse::Success { data, .. }) => data,
            Ok(ApiResponse::Error { data: Some(value), .. }) => value,
            _ => return Err("Failed to fetch proposal details.".to_string()),
        };

        proposal_returns.push(proposal_object);
    }

    Ok(ApiResponse::success(proposal_returns, "Successfully fetched proposals!".to_string()))
}

#[derive(Deserialize)]
pub struct CreateProposalRequest {
    pub subject: String,
    pub content: String,
    pub recepient: String,
}
#[command]
pub async fn create_proposal(
    state: State<'_, AppState>,
    payload: CreateProposalRequest
) -> Result<ApiResponse<ProposalObject>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let generated_id = Uuid::new_v4();

    let new_proposal = ProposalActiveModel {
        proposal_id: Set(generated_id.to_string()),
        subject: Set(payload.subject.clone()),
        content: Set(payload.content.clone()),
        status: Set("Pending".to_string()),
        response: Set("NONE".to_string()),
        recepient: Set(payload.recepient.clone()),
    };

    let new_proposal = new_proposal.insert(&db).await.map_err(|e| format!("Database error: {}", e))?;

    let proposal_return = ProposalObject {
        proposal_id: new_proposal.proposal_id,
        subject: new_proposal.subject,
        content: new_proposal.content,
        status: new_proposal.status,
        response: new_proposal.response,
        recepient: new_proposal.recepient,
    };

    Ok(ApiResponse::success(
        proposal_return,
        "Successfully created proposal!".to_string(),
    ))
}

#[derive(Deserialize)]
pub struct ProcessProposalRequest {
    pub proposal_id: String,
    pub status: String,
    pub response: String,
}
#[command]
pub async fn process_proposal(
    state: State<'_, AppState>,
    payload: ProcessProposalRequest
) -> Result<ApiResponse<ProposalObject>, String> {
    let db: DatabaseConnection = state.get_db().await.map_err(|e| e.to_string())?;

    let proposal_found = ProposalEntities::find()
        .filter(<ProposalEntities as EntityTrait>::Column::ProposalId.eq(&payload.proposal_id))
        .one(&db)
        .await
        .map_err(|e| format!("Database error: {}", e))?;

    let proposal = match proposal_found {
        Some(proposal) => proposal,
        None => return Ok(ApiResponse::error(None, "Proposal not found.".to_string())),
    };

    let updated_proposal = ProposalActiveModel {
        proposal_id: Set(proposal.proposal_id.clone()),
        subject: Set(proposal.subject.clone()),
        content: Set(proposal.content.clone()),
        status: Set(payload.status.clone()),
        response: Set(payload.response.clone()),
        recepient: Set(proposal.recepient.clone()),
    };

    let updated_proposal = updated_proposal.update(&db)
    .await
    .map_err(|e| format!("Database error: {}", e))?;

    let proposal_return = ProposalObject {
        proposal_id: updated_proposal.proposal_id,
        subject: updated_proposal.subject,
        content: updated_proposal.content,
        status: updated_proposal.status,
        response: updated_proposal.response,
        recepient: updated_proposal.recepient,
    };

    Ok(ApiResponse::success(
        proposal_return,
        "Successfully processed proposal!".to_string(),
    ))
}