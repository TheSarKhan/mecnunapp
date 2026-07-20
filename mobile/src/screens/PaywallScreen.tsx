import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Button, CheckIcon, CloseIcon, PlanCard, Screen } from '../components';
import { colors, spacing, type } from '../theme';
import { t } from '../i18n';

type PlanKey = 'monthly' | 'yearly';

const BENEFITS = [
  'paywall.benefits.unlimited',
  'paywall.benefits.profanity',
  'paywall.benefits.memory',
  'paywall.benefits.noAds',
];

export default function PaywallScreen() {
  const navigation = useNavigation();
  const [plan, setPlan] = useState<PlanKey>('yearly');

  // TODO(later): RevenueCat SDK — Purchases.getOfferings() for prices, purchasePackage() here.
  const subscribe = () => navigation.goBack();

  return (
    <Screen>
      <View style={styles.closeRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={14}>
          <CloseIcon size={17} color={colors.muted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={type.title}>{t('paywall.title')}</Text>
        <Text style={styles.copy}>{t('paywall.subtitle')}</Text>

        <View style={styles.benefits}>
          {BENEFITS.map((key) => (
            <View key={key} style={styles.benefitRow}>
              <CheckIcon size={16} color={colors.ink} />
              <Text style={type.bodyMedium}>{t(key)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          {/*
            Brief v2 §8: 10 AZN/ay başlanğıc. Yearly = 10 ay qiymətinə 12 ay ("2 ay pulsuz").
            Hardcoded until RevenueCat offerings drive this — see the TODO above; prices must be
            changeable without an app update, which is the whole reason RevenueCat is in the stack.
          */}
          <Pressable onPress={() => setPlan('yearly')}>
            <PlanCard
              name={t('paywall.yearly')}
              price="₼100"
              period="il"
              note={t('paywall.yearlyNote')}
              selected={plan === 'yearly'}
            />
          </Pressable>
          <Pressable onPress={() => setPlan('monthly')}>
            <PlanCard name={t('paywall.monthly')} price="₼10" period="ay" selected={plan === 'monthly'} />
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button label={t('paywall.subscribe')} onPress={subscribe} />
        <Button label={t('paywall.restore')} variant="ghost" onPress={() => {}} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  closeRow: { alignItems: 'flex-end', paddingTop: spacing.md },
  body: { paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg },
  copy: { ...type.secondary, fontSize: 15, lineHeight: 21 },
  benefits: { gap: spacing.md, marginVertical: spacing.sm },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  plans: { gap: spacing.md },
  actions: { gap: spacing.xs, paddingBottom: spacing.xl },
});
