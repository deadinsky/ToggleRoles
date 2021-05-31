var Discord = require('discord.io');
const serverNum = "148079346685313034"
const annChannelNum = "417253913759186944";
const sevChannelNum = "286606886940311552";
const audChannelNum = "529033610184097823";
const ownerNum = "120002774653075457";
const botNum = "651471248681074730";
const announceNum = "149634875387936769";

//Format to ping <@&role_id>

var bot = new Discord.Client({
  token: "secret",
  autorun: true
});

const roleIDs = {streamRole: "413003203274080267", communityRole: "413003223818043394", pollRole: "582675022330724363"};
const roleNames = {[roleIDs.streamRole]: "Stream Events", [roleIDs.communityRole]: "Community Events", [roleIDs.pollRole]: "Stream Poll Alerts"};
const roleStates = {[roleIDs.streamRole]: false, [roleIDs.communityRole]: false, [roleIDs.pollRole]: false};
const roleTimeout = 5 * 60 * 1000;
const timeoutID = "372568272111009795";
const timeoutTimeout = 24 * 60 * 60 * 1000;

function timeoutRole(pingRole) {
  if (roleStates[pingRole]) {
    bot.editRole({
      serverID: serverNum,
      roleID: pingRole,
      mentionable: false
    }, function() {
      roleStates[pingRole] = false;
      bot.sendMessage({
        to: annChannelNum,
        message: "Disabled " + roleNames[pingRole] + "."
      });
    });
  }
}

function timeoutReminder(userNum, username) {
  bot.removeFromRole({
    serverID: serverNum,
    userID: userNum,
    roleID: timeoutID
  }, function(err, response) {
  	if (err) {
      console.log(err);
    } else {
      bot.sendMessage({
        to: audChannelNum,
        message: "Removed timeout role for " + username + "."
      });
    }
  });
}

function getRole(message) {
  const messageSplit = message.split(" ");
  if (messageSplit.length > 1) {
    const requestedRole = messageSplit[1];
    if (requestedRole.substring(0,1) == "s" || requestedRole.substring(0,1) == "S") {
      return roleIDs.streamRole;
    } else if (requestedRole.substring(0,1) == "c" || requestedRole.substring(0,1) == "C") {
      return roleIDs.communityRole;
    } else if (requestedRole.substring(0,1) == "p" || requestedRole.substring(0,1) == "P") {
      return roleIDs.pollRole;
    }
  }
  return null;
}

bot.on('ready', function() {
  console.log('Logged in as %s - %s\n', bot.username, bot.id);
});

bot.on('message', function(user, userID, channelID, message, event) {
  if (channelID == annChannelNum) {
    if (/*event.d.member.roles.includes(announceNum)*/true) {
      if (message.substring(0,2) == "!e" || message.substring(0,2) == "!E") {
        const pingRole = getRole(message);
        console.log(pingRole);
        if (pingRole) {
          bot.editRole({
            serverID: serverNum,
            roleID: pingRole,
            mentionable: true
          }, function() {
            roleStates[pingRole] = true;
            setTimeout(timeoutRole, roleTimeout, pingRole);
            bot.sendMessage({
              to: annChannelNum,
              message: "Enabled " + roleNames[pingRole] + "."
            });
          });
        }
      }
      else if (message.substring(0,2) == "!d" || message.substring(0,2) == "!D") {
        const pingRole = getRole(message);
        if (pingRole) {
          bot.editRole({
            serverID: serverNum,
            roleID: pingRole,
            mentionable: false
          }, function() {
            roleStates[pingRole] = false;
            bot.sendMessage({
              to: annChannelNum,
              message: "Disabled " + roleNames[pingRole] + "."
            });
          });
        }
      }
    }
  }
  else if (channelID == sevChannelNum) {
    if (message.substring(0,2) == "!t" || message.substring(0,2) == "!T") {
      const messageSplit = message.split(" ");
      if (messageSplit.length > 1) {
          const userNum = messageSplit[1];
          const user = bot.users[userNum];
          const username = user.username + "#" + user.discriminator;
          bot.addToRole({
            serverID: serverNum,
            userID: userNum,
            roleID: timeoutID
          }, function(err, response) {
            console.log("Timeout - " + userNum);
            setTimeout(timeoutReminder, timeoutTimeout, userNum, username);
            if (err) {
              console.log(err);
            } else {
              bot.sendMessage({
                to: audChannelNum,
                message: "Added timeout role for " + username + "."
              });
            }
          });
      }
    }
  }
});

bot.on('disconnect', function(errMsg, code) {
  console.log("Bot has disconnected");
  console.log(errMsg);
  console.log(code);
  bot.connect();
  console.log("Reconnected");
});
