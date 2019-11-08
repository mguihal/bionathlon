import { takeEvery } from 'redux-saga/effects';

function* logSaga() {
  yield takeEvery('*', action => {
    console.log('ACTION', action);
  });
}

export default logSaga;
