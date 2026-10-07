'use client';
import BusinessMembers from '@/components/BusinessMembers';
import Header from '@/components/Header';
import {API_BASE_URL} from '@/services/api';
import {getAuthToken} from '@/utils/authCookie';
export default function TeamPage(){return <><Header/><BusinessMembers apiBase={API_BASE_URL} token={getAuthToken()}/></>;}
