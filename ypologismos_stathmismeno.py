import csv

# Αρχείο εισόδου (CSV)
input_file = 'paradeigma_epilogon_stathmismeno_gr.csv'

# Διαβάζουμε το CSV
with open(input_file, encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    criteria = []
    weights = []
    options = headers[2:]
    scores = {option: 0 for option in options}
    for row in reader:
        criteria.append(row[0])
        weight = float(row[1])
        weights.append(weight)
        for i, option in enumerate(options):
            impact = float(row[2 + i])
            scores[option] += weight * impact

# Ταξινομούμε τα αποτελέσματα
sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)

print('Αποτελέσματα κατάταξης:')
for i, (option, score) in enumerate(sorted_scores, 1):
    print(f'{i}. {option}: {score:.2f}')

# Προαιρετικά: Αποθήκευση σε νέο CSV
with open('apotelesmata.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Επιλογή', 'Σκορ'])
    for option, score in sorted_scores:
        writer.writerow([option, f'{score:.2f}'])

print('\nΤα αποτελέσματα αποθηκεύτηκαν στο apotelesmata.csv')
