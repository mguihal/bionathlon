import {
  UserAction,
  LOGIN_ERROR_UPDATED,
  LOGIN_SUCCEEDED,
  LOGIN_LOGOUT,
} from '../actionCreators/user';

import { LoginResponse } from '../sagas/api';

interface UserState {
  token: string;
  user: LoginResponse['user'];
  loginError: string;
}

const userInitialState: UserState = {
  token: localStorage.getItem('token') || '',
  user: localStorage.getItem('user')
    ? JSON.parse(localStorage.getItem('user')!)
    : {
        id: 0,
        email: '',
        name: '',
      },
  loginError: '',
};

export default function(
  state: UserState = userInitialState,
  action: UserAction,
) {
  switch (action.type) {
    case LOGIN_ERROR_UPDATED:
      return { ...state, loginError: action.error };
    case LOGIN_SUCCEEDED:
      return { ...state, token: action.token, player: action.user };
    case LOGIN_LOGOUT:
      return { ...state, token: '', loginError: action.error };
    default:
      return state;
  }
}
