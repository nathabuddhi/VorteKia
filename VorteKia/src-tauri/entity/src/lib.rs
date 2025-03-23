pub mod prelude;

pub mod broadcast;
pub mod chat_room;
pub mod chat_room_detail;
pub mod customer;
pub mod division;
pub mod lost_item;
pub mod maintenance_job_allocation;
pub mod maintenance_job;
pub mod menu;
pub mod message;
pub mod notification;
pub mod order;
pub mod order_detail;
pub mod proposal;
pub mod queue;
pub mod restaurant;
pub mod restaurant_staff_allocation;
pub mod ride;
pub mod ride_staff_allocation;
pub mod sales_associate_allocation;
pub mod souvenir;
pub mod staff;
pub mod store;
pub mod transaction;
pub mod transaction_detail;
pub mod user;
pub mod income;

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
