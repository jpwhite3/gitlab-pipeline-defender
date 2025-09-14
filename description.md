# **GitLab Pipeline Defender Game**

Game Title: Pipeline Defender  
Genre: Vertical Arcade Shooter  
Theme: Software Development / GitLab CI/CD

### **1\. Core Concept & Objective**

The player controls the GitLab Tanuki at the bottom of a vertical screen, firing binary code upwards to eliminate descending software "bugs." The ultimate goal is not just to survive, but to complete a full GitLab pipeline by collecting specific power-ups.

#### **1.1 Narrative & Theatrical Introduction**

The game begins with a theatrical sequence. The screen displays an 8-bit image of a computer monitor with the GitLab logo centered on it. A progress bar underneath the logo reads "Pipeline Executing." In the foreground, a pair of hands rests on a keyboard, as if the player is typing. Suddenly, a vortex appears on the screen, and a first-person animation shows the player being sucked into the monitor. The player's persona then transforms into the Tanuki, and the game canvas appears, ready for action.

### **2\. Game Elements**

#### **2.1 Player Character**

* **Name:** The Tanuki  
* **Appearance:** Based on the official GitLab Tanuki logo.  
* **Movement:** Horizontal-only, controlled by left/right keys or screen taps/swipes.  
* **Projectile:** Binary code (rendered as simple 1 and 0 characters or icons) fired upwards from the Tanuki.

#### **2.2 Enemies (Bugs)**

Bugs are the primary enemy, falling slowly from the top of the screen in lines. They do not fire back. Each type of bug has a distinct visual characteristic (shape and color) to make it easy to identify.

* **Type 1: Functional Errors:** Red, blocky shape.  
* **Type 2: Security Bugs:** Black, spider-like shape.  
* **Type 3: Quality Bugs:** Yellow, with a "Q" icon on them.  
* **Type 4: Embedded Secrets:** Purple, with a key icon.

#### **2.3 Power-Ups (Pipeline Components)**

Power-ups appear alongside bugs. Collecting a power-up not only grants a massive score bonus but also eliminates all bugs of a specific type from the game and stops that type from spawning for the rest of the game.

* **Power-up 1: Automated Test (TEST):** Collects all **Functional Bugs** currently on screen and prevents more from spawning.  
* **Power-up 2: Secret Manager (CSM):** Collects all **Embedded Secrets Bugs** currently on screen and prevents more from spawning.  
* **Power-up 3: Security Scan (SEC):** Collects all **Security Bugs** currently on screen and prevents more from spawning.  
* **Power-up 4: Quality Check (QUAL):** Collects all **Quality Bugs** currently on screen and prevents more from spawning.

### **3\. Game Mechanics & Flow**

#### **3.1 Win Condition**

* The player must collect all four power-ups.  
* Upon collecting the final power-up, all remaining bugs on the screen disappear, the game ends, and the player wins.

#### **3.2 Lose Conditions**

* Any bug reaches the bottom of the screen.  
* The game timer expires (e.g., a 90-second countdown).

#### **3.3 Scoring**

The scoring system is designed to heavily favor completing the pipeline.

* Shooting an individual bug: **10 points**.  
* Collecting a power-up: **1000 points**.  
* Final Score: The sum of all points earned.

#### **3.4 UI & Display**

* **Game Canvas:** A tall, portrait-aspect-ratio canvas where all gameplay occurs.  
* **Game Timer:** A countdown timer displayed at the top of the canvas.  
* **Score Display:** Shows the current score at the top of the canvas.  
* **Pipeline Panel:** A dedicated panel on the right side of the screen. It displays the four pipeline components as icons. As each power-up is collected, its icon changes visually (e.g., from grayscale to color) to indicate completion.

### **4\. Post-Game Experience**

* **Game Over Screen:** After a win or loss, the screen displays:  
  * Final Score  
  * A summary of bug kills, broken down by type.  
  * A list of the power-ups the player successfully collected.  
* **Leaderboard:** Displays high scores. A special visual marker (e.g., a trophy icon) should be placed next to any score where the player completed the entire pipeline.

### **5\. Technical Notes**

* The game must be a simple **HTML, CSS, and JavaScript** application.  
* The layout must be responsive and centered, designed for a mobile-first, portrait orientation.  
* Player controls should support both mouse clicks and touch events.  
* Collision detection is required for:  
  * Player projectiles hitting bugs.  
  * The player character collecting power-ups.  
  * Bugs reaching the bottom boundary of the screen.