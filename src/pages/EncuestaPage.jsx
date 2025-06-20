import React from 'react';
import { useParams } from 'react-router-dom';
import EncuestaPublica from '../components/encuesta-publica';

export default function EncuestaPage() {
  const { token } = useParams();
  return <EncuestaPublica token={token} />;
}
