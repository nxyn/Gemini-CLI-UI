import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '../components/animated/AnimatedBackground';
import { GlowingGreenAccent } from '../components/animated/GlowingGreenAccent';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

type RootStackParamList = {
  Settings: undefined;
  Projects: undefined;
  Login: undefined;
};

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const settingsOptions = [
    {
      icon: 'person-outline',
      title: 'Account',
      subtitle: user?.email || 'user@example.com',
      onPress: () => {},
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      onPress: () => Alert.alert('Info', 'Notifications settings coming soon'),
    },
    {
      icon: 'shield-outline',
      title: 'Privacy & Security',
      subtitle: 'Privacy settings and data management',
      onPress: () => Alert.alert('Info', 'Privacy settings coming soon'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => Alert.alert('Info', 'Help section coming soon'),
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      subtitle: 'Version 1.0.0',
      onPress: () => Alert.alert('About', 'Gemini CLI UI\n\nA cross-platform AI development assistant\n\nBuilt with React Native and Expo'),
    },
  ];

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <GlowingGreenAccent size={32} intensity="high" speed="normal" />
            <Text style={styles.title}>Settings</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {settingsOptions.slice(0, 1).map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={option.onPress}
            >
              <View style={styles.settingLeft}>
                <Ionicons name={option.icon as any} size={24} color={Colors.text.tertiary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{option.title}</Text>
                  <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {settingsOptions.slice(1, 3).map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={option.onPress}
            >
              <View style={styles.settingLeft}>
                <Ionicons name={option.icon as any} size={24} color={Colors.text.tertiary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{option.title}</Text>
                  <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {settingsOptions.slice(3, 5).map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={option.onPress}
            >
              <View style={styles.settingLeft}>
                <Ionicons name={option.icon as any} size={24} color={Colors.text.tertiary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>{option.title}</Text>
                  <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={styles.dangerSection}>
            <Button
              mode="outlined"
              onPress={handleSignOut}
              style={styles.signOutButton}
              textColor={Colors.semantic.error}
              buttonColor={Colors.background.secondary}
            >
              Sign Out
            </Button>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ using React Native</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.huge,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  section: {
    marginTop: Spacing.xxl,
  },
  sectionTitle: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
    marginLeft: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  settingTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
  },
  settingSubtitle: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    marginTop: 2,
  },
  dangerSection: {
    backgroundColor: Colors.background.secondary,
    marginHorizontal: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  signOutButton: {
    borderColor: Colors.semantic.error,
  },
  footer: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.md,
  },
});