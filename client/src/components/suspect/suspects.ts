export interface Detection {
    location: string;
    timestamp: string;
    confidence: number;
}

export interface CaseHistory {
    caseId: string;
    status: string;
    description: string;
}

export interface Suspect {
    id: string;
    name: string;
    image: string;
    dob: string;
    age: number;
    status: 'active' | 'inactive';
    alertLevel: 'low' | 'medium' | 'high';
    lastSeen: string;
    lastLocation: string;
    recentDetections: Detection[];
    caseHistory: CaseHistory[];
}

export const suspects = [
    {
        "id": "SUSP001",
        "name": "Arun Kumar",
        "image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        "dob": "1980-05-18",
        "age": 41,
        "status": "active",
        "alertLevel": "medium",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Railway Station",
        "recentDetections": [
            {
                "location": "Bus Terminal",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 77.71620930635584
            },
            {
                "location": "West Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 70.9025725559186
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE477",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP002",
        "name": "Arun Kumar",
        "image": "https://images.unsplash.com/photo-1507003211170-0a1dd7228f2d",
        "dob": "1978-04-12",
        "age": 53,
        "status": "inactive",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "West Wing",
        "recentDetections": [
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 74.05345274359831
            },
            {
                "location": "Bus Terminal",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 86.53178739822982
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE722",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP003",
        "name": "Rajesh Kumar",
        "image": "https://images.unsplash.com/photo-1507003211171-0a1dd7228f2d",
        "dob": "1981-06-26",
        "age": 23,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Parking Area",
        "recentDetections": [
            {
                "location": "Shopping Mall",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 83.65065125691623
            },
            {
                "location": "Market Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 79.74748435683628
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE206",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP004",
        "name": "Anita Gupta",
        "image": "https://images.unsplash.com/photo-1507003211172-0a1dd7228f2d",
        "dob": "1990-04-07",
        "age": 59,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "East Wing",
        "recentDetections": [
            {
                "location": "East Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 73.1221718869169
            },
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 91.1621547384252
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE510",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP005",
        "name": "Shweta Tiwari",
        "image": "https://images.unsplash.com/photo-1507003211173-0a1dd7228f2d",
        "dob": "1974-01-10",
        "age": 34,
        "status": "inactive",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Main Gate",
        "recentDetections": [
            {
                "location": "Market Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 77.87142725920346
            },
            {
                "location": "Bus Terminal",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 73.61347390998839
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE817",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP006",
        "name": "Deepak Joshi",
        "image": "https://images.unsplash.com/photo-1507003211174-0a1dd7228f2d",
        "dob": "1987-12-16",
        "age": 37,
        "status": "inactive",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Shopping Mall",
        "recentDetections": [
            {
                "location": "Railway Station",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 72.86260286869795
            },
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 89.456120697787
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE982",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP007",
        "name": "Amit Sharma",
        "image": "https://images.unsplash.com/photo-1507003211175-0a1dd7228f2d",
        "dob": "1982-11-03",
        "age": 58,
        "status": "active",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Bus Terminal",
        "recentDetections": [
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 89.39165623333741
            },
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 77.35051325487771
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE596",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP008",
        "name": "Suresh Verma",
        "image": "https://images.unsplash.com/photo-1507003211176-0a1dd7228f2d",
        "dob": "1995-01-07",
        "age": 30,
        "status": "active",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Railway Station",
        "recentDetections": [
            {
                "location": "Shopping Mall",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 82.46708428518053
            },
            {
                "location": "East Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 79.76074100319538
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE677",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP009",
        "name": "Rahul Mehta",
        "image": "https://images.unsplash.com/photo-1507003211177-0a1dd7228f2d",
        "dob": "1976-11-01",
        "age": 41,
        "status": "active",
        "alertLevel": "medium",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "West Wing",
        "recentDetections": [
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 91.6586856329742
            },
            {
                "location": "Bus Terminal",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 72.42691938290608
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE442",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP010",
        "name": "Pooja Shah",
        "image": "https://images.unsplash.com/photo-1507003211178-0a1dd7228f2d",
        "dob": "1995-02-18",
        "age": 28,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "West Wing",
        "recentDetections": [
            {
                "location": "Shopping Mall",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 84.44417315608271
            },
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 91.58607022517958
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE340",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP011",
        "name": "Deepak Joshi",
        "image": "https://images.unsplash.com/photo-1507003211179-0a1dd7228f2d",
        "dob": "1974-10-18",
        "age": 20,
        "status": "inactive",
        "alertLevel": "medium",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "West Wing",
        "recentDetections": [
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 86.10518390679496
            },
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 79.68243689960013
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE995",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP012",
        "name": "Pooja Shah",
        "image": "https://images.unsplash.com/photo-1507003211180-0a1dd7228f2d",
        "dob": "1996-09-28",
        "age": 54,
        "status": "active",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Railway Station",
        "recentDetections": [
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 71.33298872256184
            },
            {
                "location": "Bus Terminal",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 86.15331312746886
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE427",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP013",
        "name": "Anita Gupta",
        "image": "https://images.unsplash.com/photo-1507003211181-0a1dd7228f2d",
        "dob": "1988-09-12",
        "age": 46,
        "status": "inactive",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Market Area",
        "recentDetections": [
            {
                "location": "East Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 93.20134102736013
            },
            {
                "location": "West Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 70.05658462143192
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE427",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP014",
        "name": "Anita Gupta",
        "image": "https://images.unsplash.com/photo-1507003211182-0a1dd7228f2d",
        "dob": "1980-10-27",
        "age": 54,
        "status": "active",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Shopping Mall",
        "recentDetections": [
            {
                "location": "Railway Station",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 85.63691069914807
            },
            {
                "location": "Shopping Mall",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 85.22301054310817
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE729",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP015",
        "name": "Rahul Mehta",
        "image": "https://images.unsplash.com/photo-1507003211183-0a1dd7228f2d",
        "dob": "1992-10-22",
        "age": 34,
        "status": "inactive",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Main Gate",
        "recentDetections": [
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 84.56294226448173
            },
            {
                "location": "Shopping Mall",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 82.45946110688396
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE966",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP016",
        "name": "Sanjay Mishra",
        "image": "https://images.unsplash.com/photo-1507003211184-0a1dd7228f2d",
        "dob": "1984-05-24",
        "age": 29,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Market Area",
        "recentDetections": [
            {
                "location": "Market Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 79.95541340830516
            },
            {
                "location": "Bus Terminal",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 72.21581059811359
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE934",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP017",
        "name": "Priya Singh",
        "image": "https://images.unsplash.com/photo-1507003211185-0a1dd7228f2d",
        "dob": "1999-02-27",
        "age": 43,
        "status": "inactive",
        "alertLevel": "medium",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Railway Station",
        "recentDetections": [
            {
                "location": "West Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 82.43180495886297
            },
            {
                "location": "Market Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 75.31004858212629
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE695",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP018",
        "name": "Suresh Verma",
        "image": "https://images.unsplash.com/photo-1507003211186-0a1dd7228f2d",
        "dob": "1997-03-24",
        "age": 48,
        "status": "inactive",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "East Wing",
        "recentDetections": [
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 73.7011355900975
            },
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 87.58140786344752
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE306",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP019",
        "name": "Anita Gupta",
        "image": "https://images.unsplash.com/photo-1507003211187-0a1dd7228f2d",
        "dob": "1994-11-18",
        "age": 25,
        "status": "active",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Main Gate",
        "recentDetections": [
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 80.1095349375496
            },
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 78.37310960536335
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE601",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP020",
        "name": "Neha Patel",
        "image": "https://images.unsplash.com/photo-1507003211188-0a1dd7228f2d",
        "dob": "1987-06-17",
        "age": 58,
        "status": "inactive",
        "alertLevel": "medium",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "East Wing",
        "recentDetections": [
            {
                "location": "Railway Station",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 73.30296346452249
            },
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 93.8982278978176
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE251",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP021",
        "name": "Amit Sharma",
        "image": "https://images.unsplash.com/photo-1507003211189-0a1dd7228f2d",
        "dob": "1987-11-05",
        "age": 50,
        "status": "inactive",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Parking Area",
        "recentDetections": [
            {
                "location": "East Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 90.56641446264057
            },
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 84.54131976001139
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE977",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP022",
        "name": "Suresh Verma",
        "image": "https://images.unsplash.com/photo-1507003211190-0a1dd7228f2d",
        "dob": "1996-02-03",
        "age": 48,
        "status": "active",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Parking Area",
        "recentDetections": [
            {
                "location": "Market Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 89.99492436472798
            },
            {
                "location": "Shopping Mall",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 89.19103730142834
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE121",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP023",
        "name": "Shweta Tiwari",
        "image": "https://images.unsplash.com/photo-1507003211191-0a1dd7228f2d",
        "dob": "1981-01-25",
        "age": 43,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Railway Station",
        "recentDetections": [
            {
                "location": "Railway Station",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 70.171947538633
            },
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 82.5148016884935
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE987",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP024",
        "name": "Neha Patel",
        "image": "https://images.unsplash.com/photo-1507003211192-0a1dd7228f2d",
        "dob": "1985-09-24",
        "age": 41,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Parking Area",
        "recentDetections": [
            {
                "location": "Bus Terminal",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 70.06103713962474
            },
            {
                "location": "West Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 71.86037520392117
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE072",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP025",
        "name": "Amit Sharma",
        "image": "https://images.unsplash.com/photo-1507003211193-0a1dd7228f2d",
        "dob": "1982-01-16",
        "age": 56,
        "status": "active",
        "alertLevel": "medium",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Main Gate",
        "recentDetections": [
            {
                "location": "Railway Station",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 87.71695639594618
            },
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 93.29134143519671
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE404",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP026",
        "name": "Arun Kumar",
        "image": "https://images.unsplash.com/photo-1507003211194-0a1dd7228f2d",
        "dob": "1983-11-15",
        "age": 39,
        "status": "inactive",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Parking Area",
        "recentDetections": [
            {
                "location": "Railway Station",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 83.84813000008327
            },
            {
                "location": "East Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 90.34906280931187
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE322",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP027",
        "name": "Priya Singh",
        "image": "https://images.unsplash.com/photo-1507003211195-0a1dd7228f2d",
        "dob": "1998-03-20",
        "age": 54,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Bus Terminal",
        "recentDetections": [
            {
                "location": "Market Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 83.44113553573239
            },
            {
                "location": "Shopping Mall",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 86.68679011022031
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE372",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP028",
        "name": "Amit Sharma",
        "image": "https://images.unsplash.com/photo-1507003211196-0a1dd7228f2d",
        "dob": "1998-07-07",
        "age": 51,
        "status": "inactive",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Shopping Mall",
        "recentDetections": [
            {
                "location": "Railway Station",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 94.29932298982843
            },
            {
                "location": "Shopping Mall",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 88.6967047694171
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE926",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP029",
        "name": "Neha Patel",
        "image": "https://images.unsplash.com/photo-1507003211197-0a1dd7228f2d",
        "dob": "1972-12-20",
        "age": 35,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Bus Terminal",
        "recentDetections": [
            {
                "location": "Shopping Mall",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 94.25807930717335
            },
            {
                "location": "Market Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 89.0769010016395
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE882",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP030",
        "name": "Arun Kumar",
        "image": "https://images.unsplash.com/photo-1507003211198-0a1dd7228f2d",
        "dob": "1978-01-06",
        "age": 30,
        "status": "active",
        "alertLevel": "medium",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Bus Terminal",
        "recentDetections": [
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 76.1054931764535
            },
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 93.34285318874367
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE453",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP031",
        "name": "Anita Gupta",
        "image": "https://images.unsplash.com/photo-1507003211199-0a1dd7228f2d",
        "dob": "1976-04-11",
        "age": 34,
        "status": "active",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Parking Area",
        "recentDetections": [
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 94.59316828998521
            },
            {
                "location": "Railway Station",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 70.1529525742528
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE779",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP032",
        "name": "Pooja Shah",
        "image": "https://images.unsplash.com/photo-1507003211200-0a1dd7228f2d",
        "dob": "1995-06-26",
        "age": 29,
        "status": "active",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Bus Terminal",
        "recentDetections": [
            {
                "location": "West Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 81.41718605041986
            },
            {
                "location": "West Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 89.08189617865386
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE793",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP033",
        "name": "Arun Kumar",
        "image": "https://images.unsplash.com/photo-1507003211201-0a1dd7228f2d",
        "dob": "1973-07-02",
        "age": 25,
        "status": "inactive",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Main Gate",
        "recentDetections": [
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 84.01995386333107
            },
            {
                "location": "West Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 78.98597992818972
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE023",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP034",
        "name": "Shweta Tiwari",
        "image": "https://images.unsplash.com/photo-1507003211202-0a1dd7228f2d",
        "dob": "1971-10-07",
        "age": 42,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "West Wing",
        "recentDetections": [
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 80.01616475118853
            },
            {
                "location": "Market Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 87.24659248628798
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE854",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP035",
        "name": "Neha Patel",
        "image": "https://images.unsplash.com/photo-1507003211203-0a1dd7228f2d",
        "dob": "1992-08-19",
        "age": 45,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Market Area",
        "recentDetections": [
            {
                "location": "West Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 92.16590423552879
            },
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 79.69857240845369
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE475",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP036",
        "name": "Neha Patel",
        "image": "https://images.unsplash.com/photo-1507003211204-0a1dd7228f2d",
        "dob": "1982-03-23",
        "age": 52,
        "status": "active",
        "alertLevel": "medium",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Market Area",
        "recentDetections": [
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 85.58508889275691
            },
            {
                "location": "Market Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 84.43214990233633
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE112",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP037",
        "name": "Shweta Tiwari",
        "image": "https://images.unsplash.com/photo-1507003211205-0a1dd7228f2d",
        "dob": "1996-04-01",
        "age": 32,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Shopping Mall",
        "recentDetections": [
            {
                "location": "West Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 73.25788828626645
            },
            {
                "location": "Railway Station",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 74.55026840747118
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE528",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP038",
        "name": "Neha Patel",
        "image": "https://images.unsplash.com/photo-1507003211206-0a1dd7228f2d",
        "dob": "1999-08-03",
        "age": 25,
        "status": "active",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Market Area",
        "recentDetections": [
            {
                "location": "Market Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 89.48142293863356
            },
            {
                "location": "Market Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 80.34363604346304
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE393",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP039",
        "name": "Vikram Singh",
        "image": "https://images.unsplash.com/photo-1507003211207-0a1dd7228f2d",
        "dob": "1985-10-16",
        "age": 52,
        "status": "active",
        "alertLevel": "medium",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Railway Station",
        "recentDetections": [
            {
                "location": "East Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 90.24576474530603
            },
            {
                "location": "Bus Terminal",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 76.81298758934659
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE000",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP040",
        "name": "Neha Patel",
        "image": "https://images.unsplash.com/photo-1507003211208-0a1dd7228f2d",
        "dob": "1975-09-14",
        "age": 29,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Railway Station",
        "recentDetections": [
            {
                "location": "Shopping Mall",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 89.64114280240224
            },
            {
                "location": "West Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 86.86333178781229
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE799",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP041",
        "name": "Vikram Singh",
        "image": "https://images.unsplash.com/photo-1507003211209-0a1dd7228f2d",
        "dob": "1990-01-27",
        "age": 48,
        "status": "active",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Shopping Mall",
        "recentDetections": [
            {
                "location": "West Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 91.0819125498742
            },
            {
                "location": "Shopping Mall",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 93.11599442970439
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE034",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP042",
        "name": "Amit Sharma",
        "image": "https://images.unsplash.com/photo-1507003211210-0a1dd7228f2d",
        "dob": "1991-02-02",
        "age": 20,
        "status": "inactive",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Parking Area",
        "recentDetections": [
            {
                "location": "Bus Terminal",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 78.26215427186122
            },
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 73.7776680281228
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE239",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP043",
        "name": "Priya Singh",
        "image": "https://images.unsplash.com/photo-1507003211211-0a1dd7228f2d",
        "dob": "1984-02-06",
        "age": 22,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "West Wing",
        "recentDetections": [
            {
                "location": "Bus Terminal",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 73.66571154469104
            },
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 75.84449505352296
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE331",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP044",
        "name": "Rakesh Chauhan",
        "image": "https://images.unsplash.com/photo-1507003211212-0a1dd7228f2d",
        "dob": "1973-03-21",
        "age": 23,
        "status": "inactive",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Bus Terminal",
        "recentDetections": [
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 80.55466452585853
            },
            {
                "location": "Shopping Mall",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 73.00963494078457
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE199",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP045",
        "name": "Anita Gupta",
        "image": "https://images.unsplash.com/photo-1507003211213-0a1dd7228f2d",
        "dob": "1992-10-16",
        "age": 29,
        "status": "active",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Shopping Mall",
        "recentDetections": [
            {
                "location": "East Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 78.41399702749787
            },
            {
                "location": "Parking Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 87.42535110044427
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE068",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP046",
        "name": "Vikram Singh",
        "image": "https://images.unsplash.com/photo-1507003211214-0a1dd7228f2d",
        "dob": "1982-12-07",
        "age": 39,
        "status": "inactive",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "East Wing",
        "recentDetections": [
            {
                "location": "Market Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 92.08681774860109
            },
            {
                "location": "East Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 78.49186661910018
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE660",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP047",
        "name": "Suresh Verma",
        "image": "https://images.unsplash.com/photo-1507003211215-0a1dd7228f2d",
        "dob": "1986-03-19",
        "age": 53,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Parking Area",
        "recentDetections": [
            {
                "location": "East Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 72.21719251579087
            },
            {
                "location": "East Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 88.86239644341318
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE565",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP048",
        "name": "Deepak Joshi",
        "image": "https://images.unsplash.com/photo-1507003211216-0a1dd7228f2d",
        "dob": "1992-05-11",
        "age": 23,
        "status": "inactive",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Railway Station",
        "recentDetections": [
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 77.0423093323479
            },
            {
                "location": "Shopping Mall",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 77.53045845789157
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE761",
                "status": "closed",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP049",
        "name": "Deepak Joshi",
        "image": "https://images.unsplash.com/photo-1507003211217-0a1dd7228f2d",
        "dob": "1976-04-17",
        "age": 22,
        "status": "active",
        "alertLevel": "low",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "West Wing",
        "recentDetections": [
            {
                "location": "East Wing",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 81.24923561597583
            },
            {
                "location": "Bus Terminal",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 72.34847266167448
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE138",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    },
    {
        "id": "SUSP050",
        "name": "Vikram Singh",
        "image": "https://images.unsplash.com/photo-1507003211218-0a1dd7228f2d",
        "dob": "1978-10-27",
        "age": 22,
        "status": "active",
        "alertLevel": "high",
        "lastSeen": "2024-03-14 10:45:23",
        "lastLocation": "Bus Terminal",
        "recentDetections": [
            {
                "location": "Main Gate",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 94.75643206605535
            },
            {
                "location": "Market Area",
                "timestamp": "2024-03-14 10:45:23",
                "confidence": 94.96724416605107
            }
        ],
        "caseHistory": [
            {
                "caseId": "CASE454",
                "status": "active",
                "description": "Suspicious activity detected"
            }
        ]
    }
]