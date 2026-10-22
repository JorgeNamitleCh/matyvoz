import React from 'react';
import { ScrollView, View } from 'react-native';
import { Activity } from '../../../core/domain/entities';
import ActivityRow from './ActivityRow';

interface Props {
  activities: Activity[];
  onComplete: (id: string) => void;
}

export default function DayTimeline({ activities, onComplete }: Props) {
  return (
    <ScrollView>
      {activities.map(a => (
        <ActivityRow key={a.id} activity={a} onComplete={() => onComplete(a.id)} />
      ))}
    </ScrollView>
  );
}
