import api from './axios';

export const getAllUsers = () =>
  api.get('/users');

export const getUserById = (id) =>
  api.get(`/users/${id}`);

export const updateUser = (id, fields) =>
  api.put(`/users/${id}`, fields);

export const updateStatus = (id, status) =>
  api.patch(`/users/${id}/status`, { status });
