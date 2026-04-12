-- TABLE CREATION --
CREATE TABLE Coach (
    id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phoneNo VARCHAR(20),
    CONSTRAINT coach_pk PRIMARY KEY (id),
    CONSTRAINT coach_email_uq UNIQUE (email),
    CONSTRAINT coach_phone_uq UNIQUE (phoneNo)
);

CREATE TABLE HighSchool (
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    division VARCHAR(50) NOT NULL,
    CONSTRAINT highschool_pk PRIMARY KEY (name)
);

CREATE TABLE Athlete (
    id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    highSchool VARCHAR(100),
    CONSTRAINT athlete_pk PRIMARY KEY (id),
    CONSTRAINT athlete_email_uq UNIQUE (email),
    CONSTRAINT athlete_hs_fk
        FOREIGN KEY (highSchool)
        REFERENCES HighSchool(name)
        ON DELETE SET NULL
);

CREATE TABLE UniversityTeam (
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    division VARCHAR(50) NOT NULL,
    coachID INT,
    CONSTRAINT universityteam_pk PRIMARY KEY (name),
    CONSTRAINT universityteam_coach_uq UNIQUE (coachID),
    CONSTRAINT universityteam_coach_fk
        FOREIGN KEY (coachID)
        REFERENCES Coach(id)
        ON DELETE SET NULL
);

CREATE TABLE Game (
    gameID INT NOT NULL,
    gameDate DATE NOT NULL,
    CONSTRAINT game_pk PRIMARY KEY (gameID)    
);

CREATE TABLE GameStats (
    athleteID INT NOT NULL,
    gameID INT NOT NULL,
    points INT NOT NULL DEFAULT 0,
    shotsMade INT NOT NULL DEFAULT 0,
    shotsAttempted INT NOT NULL DEFAULT 0,
    threePointersMade INT NOT NULL DEFAULT 0,
    freeThrowsMade INT NOT NULL DEFAULT 0,
    freeThrowsAttempted INT NOT NULL DEFAULT 0,
    fouls INT NOT NULL DEFAULT 0,
    blocks INT NOT NULL DEFAULT 0,
    rebounds INT NOT NULL DEFAULT 0,
    assists INT NOT NULL DEFAULT 0,
    steals INT NOT NULL DEFAULT 0,
    CONSTRAINT gamestats_pk PRIMARY KEY (athleteID, gameID),
    CONSTRAINT gamestats_athlete_fk
        FOREIGN KEY (athleteID)
        REFERENCES Athlete(id)
        ON DELETE CASCADE,
    CONSTRAINT gamestats_game_fk
        FOREIGN KEY (gameID)
        REFERENCES Game(gameID)
        ON DELETE CASCADE,
    CONSTRAINT gamestats_points_ck
        CHECK (points >= 0),
    CONSTRAINT gamestats_shots_ck
        CHECK (shotsMade >= 0 AND shotsAttempted >= 0 
               AND shotsMade <= shotsAttempted),
    CONSTRAINT gamestats_threes_ck
        CHECK (threePointersMade >= 0 AND 
                threePointersMade <= shotsMade),
    CONSTRAINT gamestats_ft_ck
        CHECK (freeThrowsMade >= 0 AND freeThrowsAttempted >= 0 
                AND freeThrowsMade <= freeThrowsAttempted),
    CONSTRAINT gamestats_fouls_ck
        CHECK (fouls >= 0),
    CONSTRAINT gamestats_blocks_ck
        CHECK (blocks >= 0),
    CONSTRAINT gamestats_rebounds_ck
        CHECK (rebounds >= 0),
    CONSTRAINT gamestats_assists_ck
        CHECK (assists >= 0),
    CONSTRAINT gamestats_steals_ck
        CHECK (steals >= 0)
);

CREATE TABLE GameFilm ( 
    gameID INT NOT NULL,
    athleteID INT NOT NULL,
    filmURL VARCHAR(255) NOT NULL,
    CONSTRAINT gamefilm_pk PRIMARY KEY (gameID, athleteID, filmURL),
    CONSTRAINT gamefilm_game_fk
        FOREIGN KEY (gameID)
        REFERENCES Game(gameID)
        ON DELETE CASCADE,
    CONSTRAINT gamefilm_athlete_fk
        FOREIGN KEY (athleteID)
        REFERENCES Athlete(id)
        ON DELETE CASCADE
);

CREATE TABLE Interested (
    athleteID INT NOT NULL,
    coachID INT NOT NULL,
    offerType VARCHAR(20) NOT NULL,
    scholarshipAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT interested_pk PRIMARY KEY (athleteID, coachID),
    CONSTRAINT interested_athlete_fk
        FOREIGN KEY (athleteID)
        REFERENCES Athlete(id)
        ON DELETE CASCADE,
    CONSTRAINT interested_coach_fk
        FOREIGN KEY (coachID)
        REFERENCES Coach(id)
        ON DELETE CASCADE,
    CONSTRAINT interested_offer_ck
        CHECK (offerType IN ('Full', 'Partial', 'Walk-On', 'Preferred Walk-On')),
    CONSTRAINT interested_scholarship_ck
        CHECK (scholarshipAmount >= 0)
);

CREATE TABLE Guard (
    athleteID INT NOT NULL,
    CONSTRAINT guard_pk PRIMARY KEY (athleteID),
    CONSTRAINT guard_athlete_fk
        FOREIGN KEY (athleteID)
        REFERENCES Athlete(id)
        ON DELETE CASCADE
);

CREATE TABLE Forward (
    athleteID INT NOT NULL,
    CONSTRAINT forward_pk PRIMARY KEY (athleteID),
    CONSTRAINT forward_athlete_fk
        FOREIGN KEY (athleteID)
        REFERENCES Athlete(id)
        ON DELETE CASCADE
);

CREATE TABLE Centre (
    athleteID INT NOT NULL,
    CONSTRAINT centre_pk PRIMARY KEY (athleteID),
    CONSTRAINT centre_athlete_fk
        FOREIGN KEY (athleteID)
        REFERENCES Athlete(id)
        ON DELETE CASCADE
);

-- SAMPLE DATA INSERTS --
-- Coaches (8): university recruiters tied to university teams
INSERT INTO Coach (id, name, email, phoneNo) VALUES
(1, 'James Carter', 'jcarter@univ.ca', '604-555-1001'),
(2, 'Melissa Grant', 'mgrant@univ.ca', '604-555-1002'),
(3, 'Daniel Brooks', 'dbrooks@univ.ca', '604-555-1003'),
(4, 'Sophia Nguyen', 'snguyen@univ.ca', '604-555-1004'),
(5, 'Ryan Patel', 'rpatel@univ.ca', '604-555-1005'),
(6, 'Olivia Bennett', 'obennett@univ.ca', '604-555-1006'),
(7, 'Marcus Thompson', 'mthompson@univ.ca', '604-555-1007'),
(8, 'Priya Shah', 'pshah@univ.ca', '604-555-1008');

-- HighSchool (8): tournament teams used by athlete and game filters
INSERT INTO HighSchool (name, location, division) VALUES
('Vancouver College', 'Vancouver, BC', 'AAA'),
('St. Patrick Regional Secondary', 'Vancouver, BC', 'AA'),
('Dover Bay Secondary', 'Nanaimo, BC', 'AAA'),
('Oak Bay High School', 'Victoria, BC', 'AAA'),
('L.A. Matheson Secondary', 'Surrey, BC', 'AAA'),
('Burnaby South Secondary', 'Burnaby, BC', 'AAAA'),
('Kelowna Secondary', 'Kelowna, BC', 'AAAA'),
('Kitsilano Secondary', 'Vancouver, BC', 'AAA');

-- Athlete (80): ten-player rosters for each high school
INSERT INTO Athlete (id, name, email, highSchool) VALUES
(101, 'Ethan Wong', 'ethan.wong@vancollege.ca', 'Vancouver College'),
(102, 'Aiden Lee', 'aiden.lee@vancollege.ca', 'Vancouver College'),
(103, 'Marcus Chen', 'marcus.chen@vancollege.ca', 'Vancouver College'),
(104, 'Owen Park', 'owen.park@vancollege.ca', 'Vancouver College'),
(105, 'Caleb Singh', 'caleb.singh@vancollege.ca', 'Vancouver College'),
(106, 'Lucas Hall', 'lucas.hall@vancollege.ca', 'Vancouver College'),
(107, 'Noah Lim', 'noah.lim@vancollege.ca', 'Vancouver College'),
(108, 'Alexander Scott', 'alexander.scott@vancollege.ca', 'Vancouver College'),
(109, 'Joshua Kim', 'joshua.kim@vancollege.ca', 'Vancouver College'),
(110, 'Samuel Nelson', 'samuel.nelson@vancollege.ca', 'Vancouver College'),

(111, 'Liam Chen', 'liam.chen@stpatricks.ca', 'St. Patrick Regional Secondary'),
(112, 'Jacob Martin', 'jacob.martin@stpatricks.ca', 'St. Patrick Regional Secondary'),
(113, 'Ryan OConnor', 'ryan.oconnor@stpatricks.ca', 'St. Patrick Regional Secondary'),
(114, 'Thomas Nguyen', 'thomas.nguyen@stpatricks.ca', 'St. Patrick Regional Secondary'),
(115, 'Gabriel Santos', 'gabriel.santos@stpatricks.ca', 'St. Patrick Regional Secondary'),
(116, 'Michael Green', 'michael.green@stpatricks.ca', 'St. Patrick Regional Secondary'),
(117, 'Nathan Brooks', 'nathan.brooks@stpatricks.ca', 'St. Patrick Regional Secondary'),
(118, 'Isaiah Turner', 'isaiah.turner@stpatricks.ca', 'St. Patrick Regional Secondary'),
(119, 'Daniel Adams', 'daniel.adams@stpatricks.ca', 'St. Patrick Regional Secondary'),
(120, 'Matthew Baker', 'matthew.baker@stpatricks.ca', 'St. Patrick Regional Secondary'),

(121, 'Noah Smith', 'noah.smith@doverbay.ca', 'Dover Bay Secondary'),
(122, 'Logan White', 'logan.white@doverbay.ca', 'Dover Bay Secondary'),
(123, 'Carter Wilson', 'carter.wilson@doverbay.ca', 'Dover Bay Secondary'),
(124, 'Evan Miller', 'evan.miller@doverbay.ca', 'Dover Bay Secondary'),
(125, 'Tyler Young', 'tyler.young@doverbay.ca', 'Dover Bay Secondary'),
(126, 'Ben Foster', 'ben.foster@doverbay.ca', 'Dover Bay Secondary'),
(127, 'Aaron Phillips', 'aaron.phillips@doverbay.ca', 'Dover Bay Secondary'),
(128, 'Connor Davis', 'connor.davis@doverbay.ca', 'Dover Bay Secondary'),
(129, 'Julian Reyes', 'julian.reyes@doverbay.ca', 'Dover Bay Secondary'),
(130, 'Adam Cooper', 'adam.cooper@doverbay.ca', 'Dover Bay Secondary'),

(131, 'Mason Brown', 'mason.brown@oakbay.ca', 'Oak Bay High School'),
(132, 'Benjamin Young', 'benjamin.young@oakbay.ca', 'Oak Bay High School'),
(133, 'Jackson Lee', 'jackson.lee@oakbay.ca', 'Oak Bay High School'),
(134, 'Cole Anderson', 'cole.anderson@oakbay.ca', 'Oak Bay High School'),
(135, 'Riley Evans', 'riley.evans@oakbay.ca', 'Oak Bay High School'),
(136, 'Hunter Scott', 'hunter.scott@oakbay.ca', 'Oak Bay High School'),
(137, 'Nolan Wright', 'nolan.wright@oakbay.ca', 'Oak Bay High School'),
(138, 'Eli Thompson', 'eli.thompson@oakbay.ca', 'Oak Bay High School'),
(139, 'Isaac Ward', 'isaac.ward@oakbay.ca', 'Oak Bay High School'),
(140, 'Dylan Price', 'dylan.price@oakbay.ca', 'Oak Bay High School'),

(141, 'Aarav Gill', 'aarav.gill@lamatheson.ca', 'L.A. Matheson Secondary'),
(142, 'Elijah King', 'elijah.king@lamatheson.ca', 'L.A. Matheson Secondary'),
(143, 'Rohan Sharma', 'rohan.sharma@lamatheson.ca', 'L.A. Matheson Secondary'),
(144, 'Jayden Ali', 'jayden.ali@lamatheson.ca', 'L.A. Matheson Secondary'),
(145, 'Dev Patel', 'dev.patel@lamatheson.ca', 'L.A. Matheson Secondary'),
(146, 'Omar Khan', 'omar.khan@lamatheson.ca', 'L.A. Matheson Secondary'),
(147, 'Harpreet Sidhu', 'harpreet.sidhu@lamatheson.ca', 'L.A. Matheson Secondary'),
(148, 'Miguel Torres', 'miguel.torres@lamatheson.ca', 'L.A. Matheson Secondary'),
(149, 'Andre Johnson', 'andre.johnson@lamatheson.ca', 'L.A. Matheson Secondary'),
(150, 'Sahil Dhillon', 'sahil.dhillon@lamatheson.ca', 'L.A. Matheson Secondary'),

(151, 'Kevin Zhao', 'kevin.zhao@burnabysouth.ca', 'Burnaby South Secondary'),
(152, 'Jason Wu', 'jason.wu@burnabysouth.ca', 'Burnaby South Secondary'),
(153, 'Derek Lin', 'derek.lin@burnabysouth.ca', 'Burnaby South Secondary'),
(154, 'Brandon Ho', 'brandon.ho@burnabysouth.ca', 'Burnaby South Secondary'),
(155, 'Miles Chen', 'miles.chen@burnabysouth.ca', 'Burnaby South Secondary'),
(156, 'Victor Lam', 'victor.lam@burnabysouth.ca', 'Burnaby South Secondary'),
(157, 'Justin Ma', 'justin.ma@burnabysouth.ca', 'Burnaby South Secondary'),
(158, 'Leo Zhang', 'leo.zhang@burnabysouth.ca', 'Burnaby South Secondary'),
(159, 'Eric Sun', 'eric.sun@burnabysouth.ca', 'Burnaby South Secondary'),
(160, 'Henry Wong', 'henry.wong@burnabysouth.ca', 'Burnaby South Secondary'),

(161, 'Oliver Brooks', 'oliver.brooks@kelowna.ca', 'Kelowna Secondary'),
(162, 'Caleb Johnson', 'caleb.johnson@kelowna.ca', 'Kelowna Secondary'),
(163, 'Wyatt Moore', 'wyatt.moore@kelowna.ca', 'Kelowna Secondary'),
(164, 'Spencer Clark', 'spencer.clark@kelowna.ca', 'Kelowna Secondary'),
(165, 'Blake Harris', 'blake.harris@kelowna.ca', 'Kelowna Secondary'),
(166, 'Graham Bell', 'graham.bell@kelowna.ca', 'Kelowna Secondary'),
(167, 'Jordan Hayes', 'jordan.hayes@kelowna.ca', 'Kelowna Secondary'),
(168, 'Simon Reeves', 'simon.reeves@kelowna.ca', 'Kelowna Secondary'),
(169, 'Luke Bennett', 'luke.bennett@kelowna.ca', 'Kelowna Secondary'),
(170, 'Max Robinson', 'max.robinson@kelowna.ca', 'Kelowna Secondary'),

(171, 'Dylan Carter', 'dylan.carter@kitsilano.ca', 'Kitsilano Secondary'),
(172, 'Finn Murphy', 'finn.murphy@kitsilano.ca', 'Kitsilano Secondary'),
(173, 'Theo Campbell', 'theo.campbell@kitsilano.ca', 'Kitsilano Secondary'),
(174, 'Owen Roberts', 'owen.roberts@kitsilano.ca', 'Kitsilano Secondary'),
(175, 'Miles Walker', 'miles.walker@kitsilano.ca', 'Kitsilano Secondary'),
(176, 'Adrian Lewis', 'adrian.lewis@kitsilano.ca', 'Kitsilano Secondary'),
(177, 'Felix King', 'felix.king@kitsilano.ca', 'Kitsilano Secondary'),
(178, 'Jonah Hughes', 'jonah.hughes@kitsilano.ca', 'Kitsilano Secondary'),
(179, 'Cole Morgan', 'cole.morgan@kitsilano.ca', 'Kitsilano Secondary'),
(180, 'Parker Hill', 'parker.hill@kitsilano.ca', 'Kitsilano Secondary');

-- UniversityTeam (8): one unique coach per university team
INSERT INTO UniversityTeam (name, location, division, coachID) VALUES
('UBC Thunderbirds', 'Vancouver, BC', 'U SPORTS', 1),
('UVic Vikes', 'Victoria, BC', 'U SPORTS', 2),
('SFU Red Leafs', 'Burnaby, BC', 'NCAA D2', 3),
('UFV Cascades', 'Abbotsford, BC', 'U SPORTS', 4),
('TWU Spartans', 'Langley, BC', 'U SPORTS', 5),
('UNBC Timberwolves', 'Prince George, BC', 'U SPORTS', 6),
('Capilano Blues', 'North Vancouver, BC', 'PACWEST', 7),
('Douglas Royals', 'New Westminster, BC', 'PACWEST', 8);

-- Game (12): tournament schedule for date range and team filters
INSERT INTO Game (gameID, gameDate) VALUES
(201, '2026-02-01'),
(202, '2026-02-03'),
(203, '2026-02-05'),
(204, '2026-02-07'),
(205, '2026-02-10'),
(206, '2026-02-12'),
(207, '2026-02-14'),
(208, '2026-02-16'),
(209, '2026-02-18'),
(210, '2026-02-20'),
(211, '2026-02-22'),
(212, '2026-02-24');

-- GameStats (120): five players per team per game with realistic box scores
INSERT INTO GameStats (
    athleteID, gameID, points, shotsMade, shotsAttempted,
    threePointersMade, freeThrowsMade, freeThrowsAttempted,
    fouls, blocks, rebounds, assists, steals
) VALUES
-- Game 201: Vancouver College 64 vs L.A. Matheson Secondary 58
(101, 201, 18, 7, 14, 2, 2, 3, 2, 0, 4, 6, 2),
(102, 201, 14, 5, 10, 1, 3, 4, 1, 0, 3, 5, 1),
(103, 201, 12, 4, 9, 2, 2, 2, 2, 0, 2, 4, 2),
(104, 201, 10, 4, 8, 0, 2, 3, 3, 0, 3, 2, 1),
(105, 201, 10, 4, 9, 1, 1, 2, 2, 1, 7, 1, 0),
(141, 201, 16, 6, 13, 2, 2, 2, 2, 0, 4, 5, 1),
(142, 201, 15, 5, 12, 2, 3, 4, 2, 0, 3, 4, 2),
(143, 201, 11, 4, 8, 1, 2, 3, 1, 0, 2, 3, 1),
(144, 201, 8, 3, 7, 0, 2, 2, 2, 0, 4, 2, 1),
(145, 201, 8, 3, 8, 1, 1, 2, 3, 1, 6, 1, 0),

-- Game 202: Oak Bay High School 55 vs Dover Bay Secondary 49
(131, 202, 17, 6, 13, 2, 3, 4, 2, 0, 5, 4, 2),
(132, 202, 12, 5, 11, 1, 1, 2, 2, 0, 3, 5, 1),
(133, 202, 10, 4, 9, 1, 1, 2, 1, 0, 2, 3, 2),
(134, 202, 8, 3, 7, 0, 2, 2, 2, 0, 4, 2, 1),
(135, 202, 8, 3, 7, 1, 1, 1, 3, 1, 7, 1, 0),
(121, 202, 14, 5, 12, 2, 2, 3, 2, 0, 3, 5, 2),
(122, 202, 11, 4, 10, 1, 2, 2, 2, 0, 4, 3, 1),
(123, 202, 9, 3, 8, 1, 2, 2, 1, 0, 2, 3, 1),
(124, 202, 8, 3, 6, 0, 2, 3, 2, 0, 5, 1, 0),
(125, 202, 7, 3, 7, 0, 1, 2, 3, 1, 6, 1, 0),

-- Game 203: Burnaby South Secondary 68 vs St. Patrick Regional Secondary 60
(151, 203, 20, 8, 15, 2, 2, 3, 2, 0, 4, 6, 3),
(152, 203, 15, 6, 13, 1, 2, 2, 1, 0, 3, 5, 2),
(153, 203, 12, 5, 10, 1, 1, 2, 2, 0, 2, 4, 1),
(154, 203, 11, 4, 9, 1, 2, 3, 2, 0, 5, 2, 1),
(155, 203, 10, 4, 8, 1, 1, 2, 3, 1, 8, 1, 0),
(111, 203, 16, 6, 14, 2, 2, 3, 2, 0, 3, 5, 2),
(112, 203, 13, 5, 11, 1, 2, 2, 2, 0, 4, 4, 1),
(113, 203, 12, 4, 10, 2, 2, 3, 1, 0, 3, 3, 1),
(114, 203, 10, 4, 8, 0, 2, 2, 2, 0, 5, 2, 1),
(115, 203, 9, 3, 7, 1, 2, 2, 3, 1, 7, 1, 0),

-- Game 204: Kelowna Secondary 62 vs Kitsilano Secondary 57
(161, 204, 18, 7, 14, 2, 2, 3, 2, 0, 4, 6, 2),
(162, 204, 14, 5, 11, 1, 3, 4, 1, 0, 3, 5, 1),
(163, 204, 11, 4, 9, 1, 2, 2, 2, 0, 3, 3, 1),
(164, 204, 10, 4, 8, 1, 1, 2, 2, 0, 4, 2, 1),
(165, 204, 9, 3, 7, 1, 2, 2, 3, 1, 8, 1, 0),
(171, 204, 16, 6, 12, 2, 2, 2, 2, 0, 4, 5, 2),
(172, 204, 12, 5, 10, 1, 1, 2, 1, 0, 3, 4, 1),
(173, 204, 11, 4, 8, 1, 2, 3, 2, 0, 3, 3, 1),
(174, 204, 10, 4, 9, 0, 2, 2, 2, 0, 5, 2, 1),
(175, 204, 8, 3, 7, 1, 1, 2, 3, 1, 6, 1, 0),

-- Game 205: Vancouver College 72 vs Oak Bay High School 65
(101, 205, 22, 8, 17, 3, 3, 4, 2, 0, 5, 7, 2),
(106, 205, 15, 6, 12, 1, 2, 2, 2, 1, 7, 3, 1),
(107, 205, 13, 5, 11, 1, 2, 3, 1, 1, 6, 2, 1),
(108, 205, 12, 5, 9, 0, 2, 3, 3, 3, 11, 1, 0),
(109, 205, 10, 4, 8, 1, 1, 2, 2, 2, 8, 1, 0),
(131, 205, 19, 7, 15, 2, 3, 3, 2, 0, 6, 5, 2),
(132, 205, 15, 6, 12, 1, 2, 2, 2, 0, 3, 5, 1),
(136, 205, 12, 5, 10, 1, 1, 2, 2, 1, 7, 2, 1),
(137, 205, 10, 4, 8, 0, 2, 2, 3, 1, 8, 1, 0),
(138, 205, 9, 3, 7, 1, 2, 3, 3, 2, 9, 1, 0),

-- Game 206: L.A. Matheson Secondary 61 vs Dover Bay Secondary 54
(141, 206, 18, 7, 14, 2, 2, 3, 2, 0, 4, 6, 3),
(146, 206, 13, 5, 11, 1, 2, 3, 2, 1, 7, 2, 1),
(147, 206, 12, 5, 10, 1, 1, 2, 2, 1, 6, 2, 1),
(148, 206, 10, 4, 8, 0, 2, 2, 3, 2, 10, 1, 0),
(149, 206, 8, 3, 7, 1, 1, 2, 2, 1, 8, 1, 0),
(121, 206, 16, 6, 13, 2, 2, 3, 2, 0, 4, 5, 2),
(126, 206, 12, 5, 10, 1, 1, 2, 2, 1, 6, 2, 1),
(127, 206, 10, 4, 8, 1, 1, 2, 1, 1, 5, 2, 1),
(128, 206, 9, 3, 7, 1, 2, 2, 3, 2, 9, 1, 0),
(129, 206, 7, 3, 6, 0, 1, 2, 2, 1, 7, 1, 0),

-- Game 207: Burnaby South Secondary 66 vs Kelowna Secondary 63
(151, 207, 19, 7, 15, 2, 3, 4, 2, 0, 4, 6, 2),
(156, 207, 14, 5, 11, 1, 3, 4, 2, 1, 7, 3, 1),
(157, 207, 13, 5, 10, 1, 2, 3, 2, 1, 6, 2, 1),
(158, 207, 11, 4, 8, 1, 2, 2, 3, 3, 10, 1, 0),
(159, 207, 9, 3, 7, 1, 2, 3, 2, 2, 8, 1, 0),
(161, 207, 17, 6, 13, 2, 3, 4, 2, 0, 5, 6, 2),
(166, 207, 14, 5, 10, 1, 3, 3, 1, 1, 7, 3, 1),
(167, 207, 12, 5, 9, 1, 1, 2, 2, 1, 6, 2, 1),
(168, 207, 11, 4, 8, 1, 2, 3, 3, 3, 11, 1, 0),
(169, 207, 9, 3, 7, 1, 2, 2, 2, 2, 8, 1, 0),

-- Game 208: St. Patrick Regional Secondary 59 vs Kitsilano Secondary 52
(111, 208, 15, 6, 13, 1, 2, 3, 2, 0, 4, 5, 2),
(116, 208, 13, 5, 10, 1, 2, 3, 2, 1, 7, 2, 1),
(117, 208, 12, 5, 9, 1, 1, 2, 1, 1, 6, 2, 1),
(118, 208, 10, 4, 8, 0, 2, 2, 3, 2, 10, 1, 0),
(119, 208, 9, 3, 7, 1, 2, 2, 2, 1, 8, 1, 0),
(171, 208, 14, 5, 12, 1, 3, 4, 2, 0, 4, 5, 2),
(176, 208, 12, 5, 10, 1, 1, 2, 2, 1, 7, 2, 1),
(177, 208, 10, 4, 8, 1, 1, 2, 1, 1, 6, 2, 1),
(178, 208, 9, 3, 7, 1, 2, 2, 3, 2, 9, 1, 0),
(179, 208, 7, 3, 6, 0, 1, 2, 2, 1, 7, 1, 0),

-- Game 209: Vancouver College 70 vs Burnaby South Secondary 69
(101, 209, 21, 8, 16, 2, 3, 4, 2, 0, 5, 8, 3),
(102, 209, 14, 5, 10, 1, 3, 4, 1, 0, 3, 5, 2),
(106, 209, 13, 5, 11, 1, 2, 2, 2, 1, 8, 3, 1),
(108, 209, 12, 5, 9, 0, 2, 3, 3, 3, 12, 1, 0),
(110, 209, 10, 4, 8, 0, 2, 2, 2, 2, 9, 1, 0),
(151, 209, 20, 8, 17, 2, 2, 3, 2, 0, 5, 7, 3),
(152, 209, 15, 6, 12, 1, 2, 2, 1, 0, 3, 5, 2),
(156, 209, 13, 5, 10, 1, 2, 3, 2, 1, 7, 2, 1),
(158, 209, 11, 4, 8, 1, 2, 2, 3, 3, 10, 1, 0),
(160, 209, 10, 4, 8, 0, 2, 2, 2, 2, 9, 1, 0),

-- Game 210: Oak Bay High School 58 vs Kelowna Secondary 61
(131, 210, 16, 6, 14, 2, 2, 3, 2, 0, 5, 5, 2),
(132, 210, 13, 5, 11, 1, 2, 2, 2, 0, 4, 5, 1),
(133, 210, 11, 4, 9, 1, 2, 3, 1, 0, 3, 4, 1),
(136, 210, 10, 4, 8, 1, 1, 2, 2, 1, 7, 2, 1),
(140, 210, 8, 3, 7, 0, 2, 2, 3, 2, 9, 1, 0),
(161, 210, 18, 7, 14, 2, 2, 3, 2, 0, 5, 6, 2),
(162, 210, 14, 5, 10, 1, 3, 4, 1, 0, 3, 5, 2),
(166, 210, 12, 5, 9, 1, 1, 2, 2, 1, 7, 2, 1),
(168, 210, 9, 3, 7, 1, 2, 2, 3, 3, 10, 1, 0),
(170, 210, 8, 3, 7, 0, 2, 2, 2, 2, 9, 1, 0),

-- Game 211: L.A. Matheson Secondary 67 vs Kitsilano Secondary 56
(141, 211, 21, 8, 16, 2, 3, 4, 2, 0, 5, 7, 3),
(142, 211, 14, 5, 11, 1, 3, 4, 2, 0, 4, 5, 2),
(146, 211, 13, 5, 10, 1, 2, 2, 2, 1, 8, 2, 1),
(148, 211, 10, 4, 8, 0, 2, 3, 3, 3, 11, 1, 0),
(150, 211, 9, 3, 7, 1, 2, 2, 2, 2, 9, 1, 0),
(171, 211, 15, 6, 13, 1, 2, 3, 2, 0, 4, 5, 2),
(172, 211, 13, 5, 11, 1, 2, 2, 1, 0, 3, 5, 1),
(176, 211, 11, 4, 8, 1, 2, 3, 2, 1, 7, 2, 1),
(178, 211, 9, 3, 7, 1, 2, 2, 3, 2, 9, 1, 0),
(180, 211, 8, 3, 7, 0, 2, 2, 2, 2, 8, 1, 0),

-- Game 212: Dover Bay Secondary 60 vs St. Patrick Regional Secondary 64
(121, 212, 17, 6, 13, 2, 3, 4, 2, 0, 4, 6, 2),
(122, 212, 13, 5, 11, 1, 2, 3, 2, 0, 4, 4, 1),
(126, 212, 11, 4, 8, 1, 2, 2, 2, 1, 7, 2, 1),
(128, 212, 10, 4, 8, 0, 2, 2, 3, 3, 10, 1, 0),
(130, 212, 9, 3, 7, 1, 2, 2, 2, 2, 8, 1, 0),
(111, 212, 18, 7, 15, 2, 2, 3, 2, 0, 4, 6, 2),
(112, 212, 14, 5, 10, 1, 3, 4, 1, 0, 3, 5, 2),
(116, 212, 12, 5, 9, 1, 1, 2, 2, 1, 7, 2, 1),
(118, 212, 11, 4, 8, 1, 2, 2, 3, 2, 10, 1, 0),
(120, 212, 9, 3, 7, 1, 2, 2, 2, 2, 8, 1, 0);

-- GameFilm (40): full-game links repeated for participating athletes
INSERT INTO GameFilm (gameID, athleteID, filmURL) VALUES
(201, 101, 'https://filmhub.ca/full-game-201.mp4'),
(201, 102, 'https://filmhub.ca/full-game-201.mp4'),
(201, 103, 'https://filmhub.ca/full-game-201.mp4'),
(201, 104, 'https://filmhub.ca/full-game-201.mp4'),
(201, 105, 'https://filmhub.ca/full-game-201.mp4'),
(201, 141, 'https://filmhub.ca/full-game-201.mp4'),
(201, 142, 'https://filmhub.ca/full-game-201.mp4'),
(201, 143, 'https://filmhub.ca/full-game-201.mp4'),
(201, 144, 'https://filmhub.ca/full-game-201.mp4'),
(201, 145, 'https://filmhub.ca/full-game-201.mp4'),

(205, 101, 'https://filmhub.ca/full-game-205.mp4'),
(205, 106, 'https://filmhub.ca/full-game-205.mp4'),
(205, 107, 'https://filmhub.ca/full-game-205.mp4'),
(205, 108, 'https://filmhub.ca/full-game-205.mp4'),
(205, 109, 'https://filmhub.ca/full-game-205.mp4'),
(205, 131, 'https://filmhub.ca/full-game-205.mp4'),
(205, 132, 'https://filmhub.ca/full-game-205.mp4'),
(205, 136, 'https://filmhub.ca/full-game-205.mp4'),
(205, 137, 'https://filmhub.ca/full-game-205.mp4'),
(205, 138, 'https://filmhub.ca/full-game-205.mp4'),

(209, 101, 'https://filmhub.ca/full-game-209.mp4'),
(209, 102, 'https://filmhub.ca/full-game-209.mp4'),
(209, 106, 'https://filmhub.ca/full-game-209.mp4'),
(209, 108, 'https://filmhub.ca/full-game-209.mp4'),
(209, 110, 'https://filmhub.ca/full-game-209.mp4'),
(209, 151, 'https://filmhub.ca/full-game-209.mp4'),
(209, 152, 'https://filmhub.ca/full-game-209.mp4'),
(209, 156, 'https://filmhub.ca/full-game-209.mp4'),
(209, 158, 'https://filmhub.ca/full-game-209.mp4'),
(209, 160, 'https://filmhub.ca/full-game-209.mp4'),

(211, 141, 'https://filmhub.ca/full-game-211.mp4'),
(211, 142, 'https://filmhub.ca/full-game-211.mp4'),
(211, 146, 'https://filmhub.ca/full-game-211.mp4'),
(211, 148, 'https://filmhub.ca/full-game-211.mp4'),
(211, 150, 'https://filmhub.ca/full-game-211.mp4'),
(211, 171, 'https://filmhub.ca/full-game-211.mp4'),
(211, 172, 'https://filmhub.ca/full-game-211.mp4'),
(211, 176, 'https://filmhub.ca/full-game-211.mp4'),
(211, 178, 'https://filmhub.ca/full-game-211.mp4'),
(211, 180, 'https://filmhub.ca/full-game-211.mp4');

-- Interested (20): recruiting interest biased toward strong stat performers
INSERT INTO Interested (athleteID, coachID, offerType, scholarshipAmount) VALUES
(101, 1, 'Full', 22000.00),
(101, 3, 'Partial', 9000.00),
(151, 3, 'Full', 20000.00),
(151, 6, 'Partial', 8500.00),
(141, 5, 'Full', 19000.00),
(141, 4, 'Partial', 9500.00),
(161, 2, 'Full', 18000.00),
(131, 4, 'Partial', 12000.00),
(111, 6, 'Partial', 10000.00),
(171, 7, 'Preferred Walk-On', 0.00),
(132, 1, 'Preferred Walk-On', 0.00),
(106, 8, 'Partial', 8000.00),
(121, 3, 'Partial', 8500.00),
(142, 4, 'Walk-On', 0.00),
(152, 6, 'Preferred Walk-On', 0.00),
(108, 2, 'Partial', 7000.00),
(116, 5, 'Walk-On', 0.00),
(126, 8, 'Preferred Walk-On', 0.00),
(156, 7, 'Partial', 6500.00),
(172, 2, 'Walk-On', 0.00);

-- Guard: primary ball handlers and perimeter players
INSERT INTO Guard (athleteID) VALUES
(101), (102), (103), (104),
(111), (112), (113), (114),
(121), (122), (123), (124),
(131), (132), (133), (134),
(141), (142), (143), (144),
(151), (152), (153), (154),
(161), (162), (163), (164),
(171), (172), (173), (174);

-- Forward: wing players and frontcourt scorers
INSERT INTO Forward (athleteID) VALUES
(105), (106), (107),
(115), (116), (117),
(125), (126), (127),
(135), (136), (137),
(145), (146), (147),
(155), (156), (157),
(165), (166), (167),
(175), (176), (177);

-- Centre: interior defenders and rebounders
INSERT INTO Centre (athleteID) VALUES
(108), (109), (110),
(118), (119), (120),
(128), (129), (130),
(138), (139), (140),
(148), (149), (150),
(158), (159), (160),
(168), (169), (170),
(178), (179), (180);
