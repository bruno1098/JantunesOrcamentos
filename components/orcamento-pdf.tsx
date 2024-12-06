import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { Orcamento } from "@/types/orcamento";
import { Pedido } from "@/types/pedido";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica'
  },
  header: {
    backgroundColor: '#1a1a1a',
    margin: -30,
    marginBottom: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    width: '100%'
  },
  logo: {
    width: 90,
    height: 30,
    marginBottom: 8
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 10
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a1a',
    backgroundColor: '#f9fafb',
    padding: 6,
    borderRadius: 4,
    marginBottom: 8
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  infoBlock: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8
  },
  label: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2
  },
  value: {
    fontSize: 10,
    color: '#1a1a1a',
    fontWeight: 'bold'
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 12,
    marginBottom: 4
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    objectFit: 'cover'
  },
  itemContent: {
    flex: 1,
    flexDirection: 'column',
    gap: 4
  },
  itemName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a1a'
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemDescription: {
    fontSize: 8,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 2
  },
  summaryBox: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 6,
    marginTop: 15
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  summaryLabel: {
    color: '#9ca3af',
    fontSize: 9
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ffffff33'
  },
  totalLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  totalValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12
  },
  addressBlock: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8
  },
  addressLine: {
    fontSize: 10,
    color: '#1a1a1a',
    marginBottom: 4
  }
});

export function OrcamentoPDF({ orcamento, pedido }: { orcamento: Orcamento; pedido: Pedido }) {
  const subtotal = orcamento.itens.reduce((acc, item) => 
    acc + (item.valorUnitario * item.quantity), 0
  );
  const total = subtotal + orcamento.valorFrete;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              src="https://jantunes.vercel.app/_next/static/media/logo.fab738f9.png"
              style={styles.logo}
            />
            <Text style={styles.title}>Orçamento #{pedido.id}</Text>
            <Text style={styles.subtitle}>
              Emitido em {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Evento</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Evento</Text>
              <Text style={styles.value}>{pedido.nomeEvento}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Entrega</Text>
              <Text style={styles.value}>
                {format(new Date(pedido.dataEntrega), "dd/MM/yyyy", { locale: ptBR })}
              </Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Retirada</Text>
              <Text style={styles.value}>
                {format(new Date(pedido.dataRetirada), "dd/MM/yyyy", { locale: ptBR })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local de Entrega</Text>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLine}>
              {pedido.endereco.rua}, {pedido.endereco.numero}
              {pedido.endereco.complemento ? ` - ${pedido.endereco.complemento}` : ''}
            </Text>
            <Text style={styles.addressLine}>
              {pedido.endereco.bairro}
            </Text>
            <Text style={styles.addressLine}>
              {pedido.endereco.cidade}/{pedido.endereco.estado} - CEP: {pedido.endereco.cep}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itens</Text>
          {orcamento.itens.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              {item.image && <Image src={item.image} style={styles.itemImage} />}
              <View style={styles.itemContent}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.value}>R$ {(item.valorUnitario * item.quantity).toFixed(2)}</Text>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.label}>Quantidade: {item.quantity}</Text>
                  <Text style={styles.label}>Valor unitário: R$ {item.valorUnitario.toFixed(2)}</Text>
                </View>
                {item.observation && (
                  <Text style={styles.itemDescription}>{item.observation}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>R$ {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Frete</Text>
            <Text style={styles.summaryValue}>R$ {orcamento.valorFrete.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.value, { marginBottom: 4 }]}>J.ANTUNES LOCAÇÕES</Text>
          <Text style={styles.label}>Tel: (11) 94252-1204 | Email: j.antuness@gmail.com</Text>
          <Text style={styles.label}>Validade do orçamento: 7 dias a partir da data de emissão</Text>
        </View>
      </Page>
    </Document>
  );
} 