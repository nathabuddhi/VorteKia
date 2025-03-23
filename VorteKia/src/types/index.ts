export interface ApiResponse<T> {
    success: true | false;
    data: T | null;
    message: string | null;
}

export interface User {
    user_id: string;
    email: string;
    password: string;
    name: string;
}

export interface UserLoggedIn {
    name: string;
    user_id: string;
    role: string;
    division: string;
    balance: number;
}

export interface Division {
    division_id: string;
    division_name: string;
}

export interface Ride {
    ride_id: string;
    ride_name: string;
    ride_description: string;
    ride_pictures: string[];
    ride_status: string;
    ride_price: number;
    ride_type: string;
    opening: string;
    closing: string;
    queue_count: number;
    queue_list: string[];
}

export interface MaintenanceJob {
    job_id: string;
    location: string;
    description: string;
    notes: string;
    status: string;
    report: string;
    deadline: string;
}

export interface Notification {
    notification_id: string;
    user_id: string;
    content: string;
    time: string;
}

export interface ChatRoom {
    room_id: string;
    name: string;
}

export interface Message {
    message_id: string;
    room_id: string;
    sender_name: string;
    content: string;
    timestamp: string;
}

export interface Proposal {
    proposal_id: string;
    status: string;
    recepient: string;
    subject: String;
    content: String;
    response: String;
}

export interface LostItem {
    item_id: string;
    image: string;
    name: string;
    description: string;
    last_seen: string;
    color: string;
    status: string;
    found_at: string;
    finder_id: string;
    owner_id: string;
}

