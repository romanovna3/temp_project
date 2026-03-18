# Run these in your terminal (one at a time, with WARP connected)

**After install:** Ensure `gns` is on your PATH (e.g. add `~/.local/bin` to PATH). Then run `gns auth login` to authenticate (opens browser). If you later see **"failed to decrypt token"**, run `gns auth logout` then `gns auth login`. See also **docs/SETUP-NEW-MACHINE.md** § 5.7.

## Step 1: Download the install script
```bash
curl -v -o ~/Downloads/gns-install.sh "https://gns.int.sgns.chess-platform.com/releases/install.sh"
```
- If it works: you'll see HTTP/200 and "written" at the end; file will be at `~/Downloads/gns-install.sh`
- If it hangs or times out: the URL isn't reachable (WARP or DNS issue)

## Step 2: If Step 1 worked, run the script with debug output
```bash
bash -x ~/Downloads/gns-install.sh
```
- You'll see every line of the script as it runs, and any errors.

## Step 3: If Step 1 failed, try the web install
Open in your browser: https://gns.int.sgns.chess-platform.com/gns-client  
Download the macOS binary and we'll add it to your PATH.
