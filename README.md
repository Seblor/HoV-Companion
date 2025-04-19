# HoV Companion

A companion app for managing Heroes of Valor mods

<p align="center">
  <img src="https://github.com/Seblor/HoV-Companion/blob/master/static/logo.png?raw=true">
</p>

## Included mods

- **Logging**: Adds chat logging functionality to the game. You can choose to have a file per day or one single file.

## 3rd party mods

HoV Companion can display and allow managements of any mods that follow those 2 requirements :

### 1 - Use EU4SS version 3 experimental

The mods need to use the latest experimental build or EU4SS (https://github.com/UE4SS-RE/RE-UE4SS/releases/tag/experimental-latest)

This is due to [a bug in the 3.0.1 version of EU4SS that prevents accessing a parameter of a hooked UFunction](https://github.com/UE4SS-RE/RE-UE4SS/issues/621)

### 2 - Have a `config.txt` file in the mod folder with a subset of Lua syntax

This file must be in the mod's root directory (same directory as your `enabled.txt` should be).

The format you must respect is as such : `param_name = <value> [--comment]` ( /!\ note that the value must be a string, a number or a boolean).

Example:

```lua
enable_censor = true -- Enable censoring the chat
censor_suernames = false -- Enable censoring the usernames

censor_character = "*" -- Character used to censor the usernames
max_censor_length = 3 -- Maximum consecutive censor characters
```
