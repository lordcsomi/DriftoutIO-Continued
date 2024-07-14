# DriftoutIO Continued

Hi, I'm csomi, and I'm continuing the development of DriftoutIO. My primary goals are

## Current Goals

1. Make the game online and live again.
2. Rework the game using the Matter.js or kinetics.ts or Box2D
 
## Battle other racers to be the first to complete 20 laps! 🚗

> Select from 7 different car classes each with different attributes and some with abilities ⚔️

> Complete laps to upgrade your car and survive longer ⬆️

> Play solo to attempt for a personal best time 💨

## How to run locally:

1. Install Node js for your relevant system (https://nodejs.org/en/download/)
2. Install npm package manager (It should come installed with node.js, dependant on your specific download)
3. Install Express and Socket.io libraries using npm in terminal ("npm install express" / "npm install socket.io")
4. Run the local node server in terminal with "node _WhereverYouPutIt_\DriftoutIO\Driftout\server\server.js"
5. Open a localhost tab on port 80 in your preferred web browser ("localhost:80" as the address)
6. *Optional* You can also open a tab with your current network's ip followed by :80 (e.g. 1.1.1.1:80) to access the website from different machines

## Version info:

I'm slowly approaching the planned criteria I had imagined months ago when I had just started development. Version numbers allow me to reflect how close I am to what I feel is the full release.

We are currently at: V0.7.9

- V0.6 All upgrades functional
- V0.6.1 (Bug fix) Maps rotating inbetween games
- V0.6.2 (Bug fix) Players without godmode could damage those with godmode
- V0.6.3 (Bug fix) Upgrading was rapid upon button press
- V0.6.4 (Bug fix) Fixed thickness of collision walls to prevent out-of-bounds
- V0.6.5 Notifications are now blue when they involve you
- V0.6.6 Kills are now visible on the leaderboard (press 'q')
- V0.6.7 Buffed bullet resistance, Nerfed bullet dash upgrade / health regen + UI Changes
- V0.6.8 Players are now distributed between rooms of 8, Improved GUI

- V0.7 Optimise GUI and reward upgrade points upon kill
- V0.7.1 Further improved GUI, smoothing on car classes
- V0.7.2 Added css formatting and temporary mobile controls
- V0.7.3 Added more mobile controls and functionality
- V0.7.4 Added css mobile breakpoints for different displays dependant on screen size
- V0.7.5 Further GUI changes, reduced stress on server update packs
- V0.7.6 (Bug fix) Classes no longer display over metrics screen, aligned ability and boost containers
- V0.7.7 Mobile GUI changes, Google adsense
- V0.7.8 Major upgrade changes (HP regen nerfs). Collision algorithm changed and conenction timeouts
- V0.7.9 New class (Swapper), Room size 8 -> 10, Collision changes, GUI changes

- (Here) V0.7.9.2 Continue the development, XSS protection, some GUI changes, update dependencies 

- v0.8 Mobile integration

- v0.9 10 Classes, 4 Maps

- V1.0 Round modifiers


## Bugs:

There are currently multiple bugs on list to be corrected one by one - I will update this list as often as I can so it stays relevant.

1. -- Major -- Sometimes the camera will not properly follow the player, and tracks are out of sync with collisions. This is top of the list right now :)
2. Sometimes, but rarely, lap checkpoints can be completely missed (likely due to the size of checkpoint triggers)
3. Leaving the page open for a long while will cause a client-side crash (likely due to the assinged room no longer existing)


