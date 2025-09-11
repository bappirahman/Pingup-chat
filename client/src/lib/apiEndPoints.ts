import Env from "./env";

export const USER_BASE_URL = Env.USER_SERVICE_URL;
export const USER_PROFILE_URL = `${USER_BASE_URL}/api/v1/my-profile`;
export const USER_LOGIN = `${USER_BASE_URL}/api/v1/login`;
export const USER_VERIFY = `${USER_BASE_URL}/api/v1/verify`;
export const USER_ALL_URL = `${USER_BASE_URL}/api/v1/user/all`;
export const CHAT_BASE_URL = Env.CHAT_SERVICE_URL;
export const CHAT_ALL_URL = `${CHAT_BASE_URL}/api/v1/chat/all`;