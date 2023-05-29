import Nullable from './Nullable';

interface CompilationData {
    title: string;
    description: Nullable<string>;
    generateIndex: boolean;
    createdAt: Date;
    files: string[];
    path: string;
}

export default CompilationData;
