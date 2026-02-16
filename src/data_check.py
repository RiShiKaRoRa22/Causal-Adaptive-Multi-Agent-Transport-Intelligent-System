import pandas as pd

train_path = "data/processed/train_engineered.csv"
test_path = "data/processed/test_engineered.csv"

def check_dataset(path, name):
    print(f"\n{'='*60}")
    print(f"CHECKING DATASET: {name}")
    print(f"{'='*60}")

    df = pd.read_csv(path)

    print("\nShape:")
    print(df.shape)

    print("\nColumns:")
    print(df.columns.tolist())

    print("\nData Types:")
    print(df.dtypes)

    print("\nMissing Values:")
    print(df.isnull().sum())

    print("\nDuplicate Rows:")
    print(df.duplicated().sum())

    print("\nBasic Statistics:")
    print(df.describe())

    print("\nFirst 10 Rows:")
    print(df.head(10))

# Run checks
check_dataset(train_path, "TRAIN DATA")
check_dataset(test_path, "TEST DATA")

print("\n✅ DATA CHECK COMPLETE")