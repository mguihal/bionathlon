import { all, put, takeLatest, call } from 'redux-saga/effects';
import {
  GOOGLE_LOGIN_SUCCEEDED,
  GOOGLE_LOGIN_FAILED,
  loginSucceeded,
  updateLoginError,
  GoogleLoginSucceeded,
  GoogleLoginFailed,
} from '../actionCreators/user';

import { login, LoginResponse } from './api';

function* googleLoginFailed() {
  yield takeLatest<GoogleLoginFailed>(GOOGLE_LOGIN_FAILED, function*(action) {
    yield put(
      updateLoginError(
        `Erreur Google Auth: ${action.details || 'Erreur inconnue'}`,
      ),
    );
  });
}

function* googleLoginSucceeded() {
  yield takeLatest<GoogleLoginSucceeded>(GOOGLE_LOGIN_SUCCEEDED, function*(
    action,
  ) {
    yield put(updateLoginError(''));

    try {
      const response: LoginResponse = yield call(login, action.accessToken);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      yield put(loginSucceeded(response.token, response.user));
    } catch (e) {
      const error = e as Error;
      yield put(updateLoginError(error.message));
    }
  });
}

function* userSaga() {
  yield all([googleLoginFailed(), googleLoginSucceeded()]);
}

export default userSaga;
