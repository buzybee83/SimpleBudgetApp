import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Switch, StyleSheet, FlatList } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getAll, insert } from '@/services/db/DatabaseService';

type Income = {
  id: string;
  name: string;
  amount: number;
  date: string;
  recurring: number;
};

export default function IncomeScreen() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [recurring, setRecurring] = useState(false);

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      const data = (await getAll('income_events')) as Income[];
      setIncomes(data);
    } catch (e) {
      console.warn(e);
    }
  };

  const addIncome = async () => {
    if (!name || !amount || !date) return;
    try {
      await insert('income_events', {
        id: Date.now().toString(),
        name,
        amount: parseFloat(amount),
        date,
        recurring: recurring ? 1 : 0,
      });
      setName('');
      setAmount('');
      setDate('');
      setRecurring(false);
      loadIncomes();
    } catch (e) {
      console.warn(e);
    }
  };

  const monthlyTotal = () => {
    const now = new Date();
    return incomes
      .filter((i) => {
        const d = new Date(i.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, i) => sum + i.amount, 0);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Income</ThemedText>
      <ThemedText style={styles.total}>Total this month: ${monthlyTotal().toFixed(2)}</ThemedText>
      <View style={styles.form}>
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Amount"
          keyboardType="numeric"
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
        />
        <TextInput
          placeholder="YYYY-MM-DD"
          style={styles.input}
          value={date}
          onChangeText={setDate}
        />
        <View style={styles.switchRow}>
          <ThemedText>Recurring</ThemedText>
          <Switch value={recurring} onValueChange={setRecurring} />
        </View>
        <Button title="Add" onPress={addIncome} />
      </View>
      <FlatList
        data={incomes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ThemedText style={styles.itemName}>{item.name}</ThemedText>
            <ThemedText>${item.amount}</ThemedText>
            <ThemedText>{item.date}</ThemedText>
            {item.recurring ? <ThemedText>Recurring</ThemedText> : null}
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  total: {
    marginBottom: 16,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  item: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  itemName: {
    fontWeight: 'bold',
  },
});
