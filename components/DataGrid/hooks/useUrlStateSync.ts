import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { DataGridContextValue } from '../types';

export function useUrlStateSync<TData>(
  persistenceKey: string, 
  context: DataGridContextValue<TData>
) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync URL -> State
  useEffect(() => {
    const page = searchParams.get('page');
    const pageSize = searchParams.get('pageSize');
    const globalFilter = searchParams.get('q');

    if (page) context.setPagination(prev => ({ ...prev, pageIndex: parseInt(page) }));
    if (pageSize) context.setPagination(prev => ({ ...prev, pageSize: parseInt(pageSize) }));
    if (globalFilter) context.setGlobalFilter(globalFilter);
  }, []);

  // Sync State -> URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(context.state.pagination.pageIndex));
    params.set('pageSize', String(context.state.pagination.pageSize));
    if (context.state.globalFilter) {
      params.set('q', context.state.globalFilter);
    } else {
      params.delete('q');
    }
    setSearchParams(params, { replace: true });
  }, [context.state.pagination, context.state.globalFilter]);
}
