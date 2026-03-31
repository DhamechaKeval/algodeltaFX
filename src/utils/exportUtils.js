import {
  Alert,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
} from 'react-native';
import RNFS from 'react-native-fs';

export const exportToCSV = async (data, tab) => {
  if (!data || data.length === 0) {
    Alert.alert('No Data', 'There is no data to export.');
    return;
  }

  try {
    // ── Request permission for Android < 13 ──────────────────────
    if (Platform.OS === 'android' && Platform.Version < 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Permission Denied',
          'Storage permission required to save file.',
        );
        return;
      }
    }

    // ── Build CSV rows ────────────────────────────────────────────
    const TYPE_MAP = {
      0: 'BUY',
      1: 'SELL',
      2: 'BUY LIMIT',
      3: 'SELL LIMIT',
      4: 'BUY STOP',
      5: 'SELL STOP',
    };

    const headers = [
      'Id',
      'Symbol',
      'Ticket',
      'Type',
      'P&L',
      'Volume',
      'Price($)',
      'SL (Stop Loss)',
      'Take Profit (TP)',
      'Time',
    ];

    const rows = data.map((item, i) =>
      [
        i + 1,
        item?.symbol ?? '',
        item?.ticket ?? item?.id ?? '',
        TYPE_MAP[item?.type] ?? String(item?.type ?? ''),
        item?.profit ?? item?.pnl ?? 0,
        item?.volume ?? '',
        item?.price_open ?? item?.price ?? '',
        item?.sl ?? 0,
        item?.tp ?? 0,
        item?.time ?? '',
      ].join(','),
    );

    const csv = [headers.join(','), ...rows].join('\r\n');

    // ── Filename ─────────────────────────────────────────────────
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate(),
    )}`;
    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(
      now.getSeconds(),
    )}`;
    const prefix = tab === 'positions' ? 'Positions' : 'PendingOrders';
    const filename = `${prefix}_${dateStr}_${timeStr}.csv`;

    // ── Save to Downloads ─────────────────────────────────────────
    const path = `${RNFS.DownloadDirectoryPath}/${filename}`;
    await RNFS.writeFile(path, csv, 'utf8');

    // ── Show toast + alert ────────────────────────────────────────
    if (Platform.OS === 'android') {
      ToastAndroid.show(`Saved to Downloads: ${filename}`, ToastAndroid.LONG);
    } else {
      Alert.alert('Exported!', `Saved to Downloads:\n${filename}`);
    }
  } catch (e) {
    Alert.alert('Export Failed', e?.message || 'Something went wrong.');
  }
};
