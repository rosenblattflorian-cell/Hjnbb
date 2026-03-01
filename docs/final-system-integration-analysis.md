# BRÖTJE-Rechner: Tiefe Analyse zur Vollintegration auf Systemebene

## Zielbild (Endzustand)
Der bisherige Rechner wird zu einem integrierten Betriebs- und Vertriebssystem mit durchgängigem Datenfluss:

1. **Lead/Beratung** (Erfassung Kunden- und Gebäudedaten)
2. **Technische Berechnung** (Heizlast, Modell, JAZ, Verbrauch)
3. **Wirtschaftlichkeit/Förderung** (Invest, Zuschuss, Nettoinvest)
4. **Angebotsautomatisierung** (Positionen, Preise, Marge, Hinweise)
5. **Dokumentenstrecke** (PDF für Kunde + Baustellenakte)
6. **CRM/Projektkonvertierung** (vom Lead ins Projekt)
7. **KPI-Auswertung** (Vertrieb und Strategie)

Der entscheidende Unterschied: Es entsteht keine isolierte Kalkulation mehr, sondern eine **verwertbare Systemakte** mit Vertrieb-, Technik- und Projektbezug.

---

## 1) CRM-Integration (Firestore)

### Empfohlenes Datenschema
```ts
broetjeCalculations/{calcId}
  customer:
    name
    adresse
    email
  building:
    area
    standard
    climateZone
    heatSystem
    targetVL
  result:
    heatLoad
    model
    jaz
    annualHeat
    wpConsumption
    costPerYear
  funding:
    invest
    quote
    grant
    netInvest
  createdAt
  createdBy
```

### Systemwirkung
- **Datenpersistenz statt Einzeldatei**: jede Beratung wird nachvollziehbar.
- **Mehrfachnutzung**: dieselben Daten treiben PDF, Angebot, Förderung und KPI.
- **Konvertierung in Projekt**: `calcId` kann als Ursprung für Projekte, Tickets und Bauakte dienen.

### Erweiterung für produktiven Betrieb
- `status`: draft | reviewed | offered | won | lost
- `version`: Revisionszähler bei Angebotsupdates
- `consent`: DSGVO-Einwilligung mit Timestamp
- `riskFlags`: gespeicherte Warnhinweise aus dem Risikomodul

---

## 2) Angebotsgenerator (Automatisierung)

### Automatisch erzeugte Angebotsstruktur
- Geräteset (Eco.2 oder Mono.1)
- Speicher/Trinkwasserlösung
- Zubehörpakete
- Montage- und Elektropositionen
- Inbetriebnahme
- Förderhinweis
- Optional: Hybrid-Erweiterung

### Deckungsbeitrag
```text
Deckungsbeitrag = Verkaufspreis − Einkauf − Montage − Nebenkosten
```

### Nutzen
- **schnelle Angebotsfähigkeit** im Erstgespräch
- **einheitliche Struktur** unabhängig vom Bearbeiter
- **steuerbare Marge** statt reiner Bauchpreisbildung

---

## 3) Dynamische Preislogik

### Einflussfaktoren
- Gerätegröße
- Region
- Wettbewerb
- Montageaufwand
- Hybridkomplexität

### Kernformel
```text
Empfohlener VK = Selbstkosten × Zielmarge
```

### Empfehlung zur Umsetzung
- Preisfaktoren als **konfigurierbare Parameter** (nicht hardcodiert)
- Regionale Faktoren in Konfigurationstabelle
- Mindest-DB-Schwellenwerte als Guardrail

---

## 4) Risikomodul (Vertriebsschutz)

### Automatische Flags
- VL > 65 °C → Effizienzrisiko
- Heizkörperbestand ohne Abgleich
- hoher Heizstabanteil
- kein Puffervolumen
- Hybrid ohne klaren Bivalenzpunkt

### Wirkung
- reduziert Fehlberatung
- verhindert spätere Reklamation/Erwartungskonflikte
- schafft belastbare Beratungsdokumentation

---

## 5) Wirtschaftlichkeits-Matrix

### Mehrszenarien-Vergleich
| Szenario   | JAZ          | Kosten/Jahr |
| ---------- | ------------ | ----------- |
| WP ohne PV | 3,1          | X €         |
| WP mit PV  | 3,8 effektiv | Y €         |
| Hybrid     | Z €          |             |
| Gas alt    | Referenz     |             |

### Vertriebswirkung
- Wechsel von „Produktverkauf“ zu „Systemargumentation“
- klare, kundennahe ROI-/Kostenargumente
- besseres Cross-Selling (PV, Speicher, Hybrid)

---

## 6) KPI-Dashboard

### KPI-Vorschlag
- Durchschnittliche Heizlast
- beliebteste Geräteklasse
- Ø Marge
- PV-Quote bei WP-Kunden
- Hybrid-Anteil

### Managementnutzen
- Forecasting von Gerätetypen/Material
- Vertriebssteuerung über echte Abschluss- und Margendaten
- Segmentierung nach Region, Gebäudestandard und Systemtyp

---

## 7) Monteur-Vorbereitungsakte

### Automatisch bereitgestellte Baustelleninformationen
- Heizlast
- Modell
- Speichergröße
- Schutzbereichsprüfung
- Elektrikbedarf
- Fundamenthinweis
- Hydraulikempfehlung

### Effekt
- sauberer Übergabepunkt Vertrieb → Technik
- weniger Nachfragen und Anfahrten
- höhere Erstmontagequote ohne Nacharbeit

---

## 8) Strategische Marktpositionierung

Durch den Gesamtprozess entsteht ein differenziertes Marktprofil:
- Sanierungsstark (inkl. hoher Vorlauftemperaturen)
- Hybridfähig als Übergangslösung
- PV+WP-Kombination als Komplettpaket
- Förderlogik als integrierter Kaufhebel

Das positioniert den Betrieb als **Systemanbieter**, nicht nur als Installateur.

---

## 9) Architekturstatus & Gap-Check

### Bereits vorhanden (laut Zielstatus)
- Excel-Vertriebsversion
- Web-Rechner
- PDF-Bericht
- Förderrechner
- CRM-Integration vorbereitet
- Angebotsautomatisierung
- Risikoanalyse
- Deckungsbeitragssystem
- KPI-Auswertung

### Kritische Produktions-Gates vor Skalierung
1. **Datenqualität**: Pflichtfelder + Validierung (z. B. Vorlauftemperatur, Fläche)
2. **Auditierbarkeit**: Versionierung von Rechenlogik und Angebotsständen
3. **Revisionssicherheit**: PDF-Snapshots pro Angebotsversion
4. **Berechtigungen**: Rollenmodell (Vertrieb, Technik, Admin)
5. **DSGVO**: Einwilligung, Löschkonzept, Exportfähigkeit
6. **Monitoring**: Fehler- und Performance-Telemetrie

---

## Autonomer Abschluss auf Systemebene

Der BRÖTJE-Rechner ist in dieser Zielarchitektur kein isoliertes Tool mehr, sondern ein
**vollintegriertes Vertriebs-, Planungs- und Projektsteuerungssystem**.

Ergebnis:
- durchgängiger End-to-End-Prozess von Erstberatung bis Projektakte,
- erhöhte Abschluss- und Margenqualität,
- reduzierte Projektrisiken,
- strategisch auswertbare Datenbasis für Wachstum.
