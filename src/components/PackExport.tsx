import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Circle,
  Polygon,
  Font
} from '@react-pdf/renderer';
import { type GearItem } from '../types/gear';
import { formatWeight } from '../lib/gearUtils';

// Register the fancy font
Font.register({
  family: 'Instrument Serif',
  src: 'https://fonts.gstatic.com/s/instrumentserif/v5/jizBRFtNs2ka5fXjeivQ4LroWlx-2zI.ttf'
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#FF5C00',
    paddingBottom: 10,
  },
  title: {
    fontSize: 32,
    color: '#0A0A0B',
    marginBottom: 4,
    fontFamily: 'Instrument Serif',
  },
  chartsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  chartContainer: {
    alignItems: 'center',
    width: '45%',
  },
  chartTitle: {
    fontSize: 10,
    color: '#6B6B70',
    textTransform: 'uppercase',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  legendContainer: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 4,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 8,
    color: '#0A0A0B',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
    paddingTop: 15,
    borderTopWidth: 0.5,
    borderTopStyle: 'solid',
    borderTopColor: '#EEEEEE',
  },
  statItem: {
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: 8,
    color: '#6B6B70',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A0A0B',
  },
  statValueOrange: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF5C00',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#FF5C00',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomStyle: 'solid',
    borderBottomColor: '#EEEEEE',
    paddingBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomStyle: 'solid',
    borderBottomColor: '#E5E5E5',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#ADADB0',
    borderRadius: 2,
    marginRight: 10,
  },
  itemMultiplierWeight: {
    fontSize: 10,
    color: '#6B6B70',
    marginRight: 15,
    width: 50,
  },
  itemDetails: {
    flexDirection: 'column',
    flex: 1,
  },
  itemName: {
    fontSize: 10,
    color: '#0A0A0B',
    fontWeight: 'bold',
  },
  itemBrand: {
    fontSize: 8,
    color: '#8B8B90',
  },
  watermark: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    opacity: 0.03,
    zIndex: -1,
  }
});

// Helper to draw an SVG Pie Chart for @react-pdf/renderer
const Watermark = () => (
  <View style={styles.watermark} fixed>
    <Svg viewBox="0 0 900 600">
      <Polygon points="125,500 375,100 625,500" fill="#FF5C00" />
      <Polygon points="325,500 525,180 725,500" fill="#FF8A4C" />
      <Polygon points="525,500 650,300 775,500" fill="#2A2A2E" />
    </Svg>
  </View>
);

const PieChart = ({ data, units, size = 100 }: { data: { label: string, value: number, color: string }[], units: 'metric' | 'imperial', size?: number }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <Svg width={size} height={size}>
        <Circle cx={size/2} cy={size/2} r={size/2} fill="#eeeeee" />
      </Svg>
    );
  }

  let cumulative = 0;
  const radius = size / 2;
  const cx = radius;
  const cy = radius;

  const paths = data.map((d, i) => {
    if (d.value === 0) return null;

    // If a single slice takes up the whole pie, just draw a circle
    if (d.value === total) {
      return <Circle key={i} cx={cx} cy={cy} r={radius} fill={d.color} />;
    }

    const startAngle = cumulative * 360;
    cumulative += d.value / total;
    const endAngle = cumulative * 360;

    const startX = cx + radius * Math.cos((startAngle - 90) * Math.PI / 180);
    const startY = cy + radius * Math.sin((startAngle - 90) * Math.PI / 180);
    const endX = cx + radius * Math.cos((endAngle - 90) * Math.PI / 180);
    const endY = cy + radius * Math.sin((endAngle - 90) * Math.PI / 180);

    const largeArcFlag = d.value / total > 0.5 ? 1 : 0;
    const pathData = [
      `M ${cx} ${cy}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ');

    return <Path key={i} d={pathData} fill={d.color} />;
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {paths}
      </Svg>
      <View style={styles.legendContainer}>
        {data.filter(d => d.value > 0).map((d, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: d.color }]} />
            <Text style={styles.legendText}>{d.label} ({formatWeight(d.value, units)})</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

interface PackExportProps {
  packName: string;
  units: 'metric' | 'imperial';
  items: Array<{
    gear: GearItem;
    qty: number;
    overrideWeight?: number;
  }>;
  stats: {
    total: number;
    base: number;
    worn: number;
    consumable: number;
  };
}

export const PackExport = ({ packName, units, items, stats }: PackExportProps) => {
  // Group items by TT
  const grouped: Record<string, typeof items> = {};
  items.forEach(item => {
    const tt = item.gear.tagPath.tt;
    if (!grouped[tt]) grouped[tt] = [];
    grouped[tt].push(item);
  });

  // Calculate TT Distribution
  const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
  const ttMap: Record<string, number> = {};
  items.forEach(item => {
    const tt = item.gear.tagPath.tt;
    ttMap[tt] = (ttMap[tt] || 0) + (item.overrideWeight ?? item.gear.weight) * item.qty;
  });

  const ttColorMap: Record<string, string> = {};
  const ttData = Object.entries(ttMap)
    .sort((a, b) => b[1] - a[1]) // Sort largest to smallest
    .map(([label, value], i) => {
      const color = colors[i % colors.length];
      ttColorMap[label] = color;
      return {
        label,
        value,
        color
      };
    });

  // Calculate Weight Type Distribution
  const wtData = [
    { label: 'Base', value: stats.base, color: '#1f77b4' },
    { label: 'Worn', value: stats.worn, color: '#ff7f0e' },
    { label: 'Consumable', value: stats.consumable, color: '#2ca02c' },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Watermark />
        <View style={styles.header}>
          <Text style={styles.title}>{packName}</Text>
        </View>

        <View style={styles.chartsRow}>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Category Distribution</Text>
            <PieChart data={ttData} units={units} size={100} />
          </View>
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Weight Distribution</Text>
            <PieChart data={wtData} units={units} size={100} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Weight</Text>
            <Text style={styles.statValue}>{formatWeight(stats.total, units, true)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Base Weight</Text>
            <Text style={styles.statValueOrange}>{formatWeight(stats.base, units, true)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Worn</Text>
            <Text style={styles.statValue}>{formatWeight(stats.worn, units, true)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Consumable</Text>
            <Text style={styles.statValue}>{formatWeight(stats.consumable, units, true)}</Text>
          </View>
        </View>

        {Object.entries(grouped).sort().map(([tt, gearItems]) => (
          <View key={tt} wrap={false}>
            <Text style={[styles.sectionTitle, { color: ttColorMap[tt] || '#FF5C00' }]}>{tt}</Text>
            {gearItems.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <View style={styles.checkbox}></View>
                  <Text style={styles.itemMultiplierWeight}>
                    {item.qty}x {formatWeight((item.overrideWeight ?? item.gear.weight), units)}
                  </Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.gear.name}</Text>
                    <Text style={styles.itemBrand}>{item.gear.brand}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};
