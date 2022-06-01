export interface TransferItem {
    sourcePath: string;
    destinationPath: string;
    recursive: boolean;

}

export interface TransferDocument {
    dataType: string;
    submissionId: string;
    label: string;
    sourceEndpoint: string;
    destinationEndpoint: string;
    data: TransferItem[];
}