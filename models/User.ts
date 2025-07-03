export class User {
    id: number;
    username: string;
    password: string;
    name: string;
    role: 'super' | 'admin' | 'employee';
    officeId: number;

    constructor(
        id: number,
        username: string,
        password: string,
        name: string,
        role: 'super' | 'admin' | 'employee',
        officeId: number
    ) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.name = name;
        this.role = role;
        this.officeId = officeId;
    }
}