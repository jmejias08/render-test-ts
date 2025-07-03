export class Office {
    id: number;
    name: string;
    phone: string;
    address: string;
    email: string;
    id_card: string;

    constructor(
        id: number,
        name: string,
        phone: string,
        address: string,
        email: string,
        id_card: string
    ) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.email = email;
        this.id_card = id_card;
    }
}