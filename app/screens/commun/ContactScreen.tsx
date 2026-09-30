import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Mail, MapPin, Phone, Send } from 'lucide-react-native';
import PageHeader from '../../../components/PageHeader';
import { envoyerContact } from '../../../services/api';
import Card from '../../../components/ui/Card';
import PrimaryButton from '../../../components/ui/PrimaryButton';

const SUJETS = ['Problème de paiement', 'Intégration technique', 'Partenariat', 'Autre demande'];

export default function ContactScreen() {
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [sujet, setSujet] = useState(SUJETS[0]);
  const [message, setMessage] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const handleEnvoyer = async () => {
    if (!nom || !email || !telephone || !message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }
    setEnvoi(true);
    try {
      await envoyerContact({ name: nom, email, phone: telephone, subject: sujet, message });
      Alert.alert('Message envoyé', 'Notre équipe vous répondra dans les 24h ouvrables.');
      setNom('');
      setEmail('');
      setTelephone('');
      setMessage('');
    } catch (error: any) {
      if (error.response) {
        // Erreur applicative (validation 422, etc.) : l'API a répondu, on affiche son message réel.
        const messagesValidation = error.response.data?.errors
          ? Object.values(error.response.data.errors).flat().join('\n')
          : null;
        Alert.alert('Erreur', messagesValidation || error.response.data?.message || 'Votre message n\'a pas pu être envoyé.');
      } else {
        // Aucune réponse du serveur (hors ligne) : repli sur le client mail.
        const corps = `Nom : ${nom}\nEmail : ${email}\nTéléphone : ${telephone}\nSujet : ${sujet}\n\n${message}`;
        Linking.openURL(`mailto:contact@edupay.cm?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`);
      }
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <View style={styles.container}>
      <PageHeader
        tag="Assistance EduPay"
        titre="Nous sommes là pour vous accompagner"
        sousTitre="Notre équipe répond dans les 24h ouvrables."
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MapPin size={16} color="#0D9E75" />
            <Text style={styles.infoTxt}>Yaoundé, Cameroun</Text>
          </View>
          <View style={styles.infoRow}>
            <Phone size={16} color="#0D9E75" />
            <Text style={styles.infoTxt}>+237 654 862 989 · +237 688 462 229</Text>
          </View>
          <View style={styles.infoRow}>
            <Mail size={16} color="#0D9E75" />
            <Text style={styles.infoTxt}>contact@edupay.cm</Text>
          </View>
        </Card>

        <Text style={styles.secLabel}>ENVOYEZ-NOUS UN MESSAGE</Text>

        <Text style={styles.lbl}>Nom complet *</Text>
        <TextInput style={styles.input} placeholder="Votre nom complet" placeholderTextColor="#AAAAAA" value={nom} onChangeText={setNom} />
        <Text style={styles.lbl}>Email *</Text>
        <TextInput style={styles.input} placeholder="Votre email" placeholderTextColor="#AAAAAA" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Text style={styles.lbl}>Téléphone *</Text>
        <TextInput style={styles.input} placeholder="+237 6XX XXX XXX" placeholderTextColor="#AAAAAA" value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />

        <Text style={styles.lbl}>Sujet *</Text>
        <View style={styles.chipsRow}>
          {SUJETS.map((s) => (
            <TouchableOpacity key={s} style={[styles.chip, sujet === s && styles.chipActive]} onPress={() => setSujet(s)}>
              <Text style={[styles.chipTxt, sujet === s && styles.chipTxtActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.lbl}>Message *</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Décrivez votre demande..."
          placeholderTextColor="#AAAAAA"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={5}
        />

        <PrimaryButton
          title="Envoyer le message"
          onPress={handleEnvoyer}
          loading={envoi}
          icon={<Send size={16} color="#FFFFFF" />}
          style={{ marginTop: 20 }}
        />
        <Text style={styles.note}>Nous répondons dans les 24h ouvrables.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F7' },
  content: { flex: 1, padding: 16 },
  infoCard: { padding: 16, marginBottom: 24, gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoTxt: { fontSize: 12, color: '#333333', fontWeight: '600' },
  secLabel: { fontSize: 10, fontWeight: '800', color: '#888888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#666666', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1A1A2E' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  chipActive: { backgroundColor: '#0D9E75', borderColor: '#0D9E75' },
  chipTxt: { fontSize: 11, fontWeight: '600', color: '#1A1A2E' },
  chipTxtActive: { color: '#FFFFFF' },
  textarea: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 13, color: '#1A1A2E', textAlignVertical: 'top', minHeight: 100 },
  note: { fontSize: 11, color: '#AAAAAA', textAlign: 'center', marginTop: 10 },
});
