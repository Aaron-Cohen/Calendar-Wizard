export interface Duration {
    start: Date,
    end: Date,
}

export interface WebsiteEvent {
    title: string,
    url: string,
    date: string,
    equipment: string,
}

export interface ParsedEvent {
    title: string,
    url: string,
    date: Duration,
    equipment: string,
}

export interface Message{
    flavor: string,
    args: Array<any>,
}
