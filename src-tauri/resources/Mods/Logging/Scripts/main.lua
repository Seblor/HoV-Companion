-- Helper function to log to file
local function LogToFile(user, message, is_special)
  local log_file = io.open(os.getenv("LOCALAPPDATA") .. "/HeroesOfValor/Saved/Logs/ChatLog.txt", "a")
  if log_file then
    local time = os.date("%Y-%m-%d %H:%M:%S")
    local line = string.format("[%s] %s: %s\n", time, user, message)
    log_file:write(line)
    log_file:close()
  end
end

-- Locate the class and function
-- Update this path if needed after checking Generated/ folder
local class_path = "/Game/Widgets/W_IngameChat.W_IngameChat_C"
local chat_class = StaticFindObject(class_path)
local isRegistered = false

if chat_class == nil then
  print("[LogChat] ❌ Could not find class at " .. class_path .. '\n')
  return
end

local function RegisterEvent()
  if isRegistered then
    print("[LogChat] ❌ Already loaded, skipping...\n")
    return
  end

  RegisterHook(class_path .. ":AddMessage", function(self, UserName, Message, SpecialMessage)
    local user_str = UserName:get():ToString()
    local msg_str = Message:get():ToString()
    print("||" .. tostring(SpecialMessage:get()) .. "||")
    local special = SpecialMessage

    print(string.format("[LogChat] 📨 %s: %s", user_str, msg_str))
    LogToFile(user_str, msg_str, special)
  end)

  isRegistered = true
end

RegisterInitGameStatePostHook(function()
  for _, GameDirectory in pairs(IterateGameDirectories()) do
    print(GameDirectory.__name)
    print(GameDirectory.__absolute_path)
  end
  -- Hook the AddMessage function
  RegisterEvent()
end)

local success, err = pcall(RegisterEvent)
