
const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    // TODO: Implement this function

    
    let start = new Date("1970-01-01 " + startTime);
    let end = new Date("1970-01-01 " + endTime);

    if (end < start) {
        end.setDate(end.getDate() + 1);
    }

    let diff = end - start;

    
    let hours = Math.floor(diff / (1000 * 60 * 60));
    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return hours + ":" + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}




// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
   
    let start = new Date("1970-01-01 " + startTime);
    let end = new Date("1970-01-01 " + endTime);

    
    if (end < start) {
        end.setDate(end.getDate() + 1);
    }

   
    let workStart = new Date("1970-01-01 8:00:00 AM");
    let workEnd = new Date("1970-01-01 10:00:00 PM");

    let idle = 0; 

   
    if (start < workStart) idle += workStart - start;

    
    if (end > workEnd) idle += end - workEnd;

    
    let hours = Math.floor(idle / (1000 * 60 * 60));
    let minutes = Math.floor((idle % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((idle % (1000 * 60)) / 1000);

  
    return hours + ":" + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}






    

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    // TODO: Implement the function
    
    let [h1,m1,s1] = shiftDuration.split(":").map(Number);
    let [h2,m2,s2] = idleTime.split(":").map(Number);


    let shiftSec = h1*3600 + m1*60 + s1;
    let idleSec = h2*3600 + m2*60 + s2;

    let activeSec = shiftSec - idleSec;
    if(activeSec < 0) activeSec = 0;

    
    let hours = Math.floor(activeSec/3600);
    let minutes = Math.floor((activeSec % 3600)/60);
    let seconds = activeSec % 60;

    return hours + ":" + String(minutes).padStart(2,"0") + ":" + String(seconds).padStart(2,"0");
}






// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    // TODO: Implement this function

    
    let quotaHours = 8;
    let quotaMinutes = 24;

    
    let d = new Date(date);
    if(d >= new Date("2025-04-10") && d <= new Date("2025-04-30")) {
        quotaHours = 6;
        quotaMinutes = 0;
    }

    
    let quotaSec = quotaHours*3600 + quotaMinutes*60;

    
    let [h,m,s] = activeTime.split(":").map(Number);
    let activeSec = h*3600 + m*60 + s;

    
    return activeSec >= quotaSec;



}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    // TODO: Implement this function
    
const fs = require("fs");

    
    let data = "";
    try { data = fs.readFileSync(textFile, "utf8"); } catch(e) { data = ""; }

   
    let lines = data.trim() ? data.trim().split("\n") : [];
    if (lines.some(line => line.split(",")[0] === shiftObj.driverID && line.split(",")[2] === shiftObj.date)) {
        return {}; 
    }

    
    let shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    let idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    let activeTime = getActiveTime(shiftDuration, idleTime);
    let metQuotaVal = metQuota(shiftObj.date, activeTime);

    
    let newEntry = {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration,
        idleTime,
        activeTime,
        metQuota: metQuotaVal,
        hasBonus: false
    };

    
    let newLine = Object.values(newEntry).join(",");
    lines.push(newLine); 
    fs.writeFileSync(textFile, lines.join("\n"));

    return newEntry;


}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function
     const fs = require("fs");

    
    let data = fs.readFileSync(textFile, "utf8");
    let lines = data.split("\n");

    
    lines = lines.map(line => {
        if (!line) return line; 
        let parts = line.split(",");
        if (parts[0] === driverID && parts[2] === date) {
            parts[9] = newValue; 
        }
        return parts.join(",");
        
    });


    fs.writeFileSync(textFile, lines.join("\n"), "utf8");
}


// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
 const fs = require("fs");

 let lines = fs.readFileSync(textFile, "utf8").trim().split("\n");

 let count = 0;
 let driverFound = false;

 for (let line of lines) {

 if (!line) continue;

 let cols = line.split(",");

 let id = cols[0];
 let date = cols[2];
 let bonus = cols[9];

 if (id === driverID) {

 driverFound = true;

 let m = parseInt(date.split("-")[1]);

 if (m === parseInt(month) && bonus.trim() === "true") {
 count++;
 }

 }

 }

 if (!driverFound) return -1;

 return count;
}
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    const fs = require("fs");

    
    let data = fs.readFileSync(textFile, "utf8").trim();
    if (!data) return "0:00:00";

    let lines = data.split("\n");

    if (lines[0].includes("driverID")) lines.shift();

    let totalSeconds = 0;
    let monthNum = parseInt(month);

    for (let line of lines) {
        if (!line) continue;
        let parts = line.split(",");
        let id = parts[0];
        let date = parts[2];
        let activeTime = parts[7]; 

        if (id !== driverID) continue;

        let lineMonth = parseInt(date.split("-")[1]);
        if (lineMonth !== monthNum) continue;

        let [h, m, s] = activeTime.split(":").map(Number);
        totalSeconds += h*3600 + m*60 + s;
    }

    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    return `${hours}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}
// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
    
    let rateLines = fs.readFileSync(rateFile, "utf8").trim().split("\n");
    let dayOff = "";
    for (let line of rateLines) {
        let parts = line.split(",");
        if (parts[0] === driverID) {
            dayOff = parts[1];
            break;
        }
    }

    
    let shiftLines = fs.readFileSync(textFile, "utf8").trim().split("\n");
    let header = shiftLines.shift();

  
    let driverMonthLines = shiftLines.filter(line => {
        let parts = line.split(",");
        let id = parts[0];
        let date = parts[2];
        let lineMonth = parseInt(date.split("-")[1]);
        return id === driverID && lineMonth === month;
    });

    
   

    
    let totalSec = 0;
    for (let line of driverMonthLines) {
        let parts = line.split(",");
        let date = parts[2];
        let dayName = new Date(date).toLocaleDateString("en-US",{weekday:"long"});
        let d = parseInt(date.split("-")[2]);

        
        if (dayName === dayOff) continue;

        
        let m = parseInt(date.split("-")[1]);
        if (m === 4 && d >= 10 && d <= 30) {
            totalSec += 6 * 3600; 
        } else {
            totalSec += 8 * 3600 + 24 * 60;
        }
    }

    
    totalSec -= bonusCount * 2 * 3600;
    if (totalSec < 0) totalSec = 0;

   
    let hours = Math.floor(totalSec / 3600);
    let minutes = Math.floor((totalSec % 3600) / 60);
    let seconds = totalSec % 60;

  
    

    return `${hours}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}


// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
   function hmsToSeconds(hms) {
        let [h, m, s] = hms.split(":").map(Number);
        return h*3600 + m*60 + s;
    }

    
    let rateLines = fs.readFileSync(rateFile, "utf8").trim().split("\n");

    let basePay = 0;
    let tier = 0;

    
    for (let line of rateLines) {
        let parts = line.split(",");
        if (parts[0] === driverID) {
            basePay = parseInt(parts[2]);
            tier = parseInt(parts[3]);
        }
    }

   
    let allowedMissing = [0,50,20,10,3][tier];

   
    let actual = hmsToSeconds(actualHours);
    let required = hmsToSeconds(requiredHours);

   
    if (actual >= required) return basePay;

  
    let missing = required - actual;

    let missingHours = Math.floor(missing / 3600);

   
    missingHours -= allowedMissing;

    if (missingHours < 0) missingHours = 0;

    
    let deductionRate = Math.floor(basePay / 185);

    let salaryDeduction = missingHours * deductionRate;

    
    return basePay - salaryDeduction;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};

