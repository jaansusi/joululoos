export interface Member {
    name: string;
    email?: string;
}

export interface Family {
    members: Member[];
}

export interface Families extends Array<Family> { }

export default [
    {
        members: [
            {
                name: "Jaan",
                email: "jaan.susi@gmail.com"
            },
            {
                name: "Kristiina",
                email: "kristiina.susi93@gmail.com"
            }
        ]
    },
    {
        members: [
            {
                name: "Katre"
            },
            {
                name: "Gristen"
            },
            {
                name: "Nana"
            },
            {
                name: "Eti"
            },
            {
                name: "Mattias"
            }
        ]
    },
    {
        members: [
            {
                name: "Toomas"
            },
            {
                name: "Helle"
            },
            {
                name: "Emilie"
            }
        ]
    },
    {
        members: [
            {
                name: "Villem",
                email: "villem.susi@gmail.com"
            }
        ]
    },
    {
        members: [
            {
                name: "Rasmus"
            },
            {
                name: "Carmen"
            }
        ]
    },
    {
        members: [
            {
                name: "Mattias"
            }
        ]
    }
] as Families;