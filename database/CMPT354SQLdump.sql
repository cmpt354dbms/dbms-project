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
-- Coach (5)
INSERT INTO Coach (id, name, email, phoneNo) VALUES
(1, 'James Carter', 'jcarter@univ.ca', '604-555-1001'),
(2, 'Melissa Grant', 'mgrant@univ.ca', '604-555-1002'),
(3, 'Daniel Brooks', 'dbrooks@univ.ca', '604-555-1003'),
(4, 'Sophia Nguyen', 'snguyen@univ.ca', '604-555-1004'),
(5, 'Ryan Patel', 'rpatel@univ.ca', '604-555-1005');

-- HighSchool (5)
INSERT INTO HighSchool (name, location, division) VALUES
('Vancouver College', 'Vancouver, BC', 'AAA'),
('St. Patrick Regional Secondary', 'Vancouver, BC', 'AA'),
('Dover Bay Secondary', 'Nanaimo, BC', 'AAA'),
('Oak Bay High School', 'Victoria, BC', 'AAA'),
('L.A. Matheson Secondary', 'Surrey, BC', 'AAA');

-- Athlete (15)
INSERT INTO Athlete (id, name, email, highSchool) VALUES
(101, 'Ethan Wong', 'ethan.wong@email.com', 'Vancouver College'),
(102, 'Liam Chen', 'liam.chen@email.com', 'St. Patrick Regional Secondary'),
(103, 'Noah Smith', 'noah.smith@email.com', 'Dover Bay Secondary'),
(104, 'Mason Brown', 'mason.brown@email.com', 'Oak Bay High School'),
(105, 'Lucas Hall', 'lucas.hall@email.com', 'L.A. Matheson Secondary'),

(106, 'Aiden Lee', 'aiden.lee@email.com', 'Vancouver College'),
(107, 'Jacob Martin', 'jacob.martin@email.com', 'St. Patrick Regional Secondary'),
(108, 'Logan White', 'logan.white@email.com', 'Dover Bay Secondary'),
(109, 'Benjamin Young', 'benjamin.young@email.com', 'Oak Bay High School'),
(110, 'Elijah King', 'elijah.king@email.com', 'L.A. Matheson Secondary'),

(111, 'Alexander Scott', 'alexander.scott@email.com', 'Vancouver College'),
(112, 'Michael Green', 'michael.green@email.com', 'St. Patrick Regional Secondary'),
(113, 'Daniel Adams', 'daniel.adams@email.com', 'Dover Bay Secondary'),
(114, 'Matthew Baker', 'matthew.baker@email.com', 'Oak Bay High School'),
(115, 'Samuel Nelson', 'samuel.nelson@email.com', 'L.A. Matheson Secondary');

-- UniversityTeam (5)
INSERT INTO UniversityTeam (name, location, division, coachID) VALUES
('UBC Thunderbirds', 'Vancouver, BC', 'U SPORTS', 1),
('UVic Vikes', 'Victoria, BC', 'U SPORTS', 2),
('SFU Red Leafs', 'Burnaby, BC', 'NCAA D2', 3),
('UFV Cascades', 'Abbotsford, BC', 'U SPORTS', 4),
('TWU Spartans', 'Langley, BC', 'U SPORTS', 5);

-- Game (5)
INSERT INTO Game (gameID, gameDate) VALUES
(201, '2026-02-01'),
(202, '2026-02-05'),
(203, '2026-02-10'),
(204, '2026-02-15'),
(205, '2026-02-20');

-- GameStats (5)
INSERT INTO GameStats (
    athleteID, gameID, points, shotsMade, shotsAttempted,
    threePointersMade, freeThrowsMade, freeThrowsAttempted,
    fouls, blocks, rebounds, assists, steals
) VALUES
(101, 201, 18, 7, 14, 2, 2, 3, 2, 0, 4, 6, 2),
(102, 202, 12, 5, 11, 1, 1, 2, 1, 0, 3, 5, 1),
(106, 203, 15, 6, 13, 1, 2, 2, 3, 1, 7, 2, 1),
(111, 204, 10, 4, 9, 0, 2, 4, 4, 3, 10, 1, 0),
(115, 205, 22, 8, 16, 2, 4, 5, 2, 2, 11, 1, 1);

-- GameFilm (5)
INSERT INTO GameFilm (gameID, athleteID, filmURL) VALUES
(201, 101, 'https://filmhub.ca/game201_athlete101.mp4'),
(202, 102, 'https://filmhub.ca/game202_athlete102.mp4'),
(203, 106, 'https://filmhub.ca/game203_athlete106.mp4'),
(204, 111, 'https://filmhub.ca/game204_athlete111.mp4'),
(205, 115, 'https://filmhub.ca/game205_athlete115.mp4');

-- Interested (5)
INSERT INTO Interested (athleteID, coachID, offerType, scholarshipAmount) VALUES
(101, 1, 'Full', 20000.00),
(102, 2, 'Partial', 10000.00),
(106, 3, 'Walk-On', 0.00),
(111, 4, 'Preferred Walk-On', 0.00),
(115, 5, 'Partial', 12000.00);

-- Guard (5)
INSERT INTO Guard (athleteID) VALUES
(101),
(102),
(103),
(104),
(105);

-- Forward (5)
INSERT INTO Forward (athleteID) VALUES
(106),
(107),
(108),
(109),
(110);

-- Centre (5)
INSERT INTO Centre (athleteID) VALUES
(111),
(112),
(113),
(114),
(115);
