import Vue from 'vue'
import Vuetable from './components/Vuetable.vue'
import VuetablePagination from './components/VuetablePagination.vue'
import VuetablePaginationDropdown from './components/VuetablePaginationDropdown.vue'
import VuetablePaginationInfo from './components/VuetablePaginationInfo.vue'

let E_SERVER_ERROR = 'Error communicating with the server'

Vue.component('custom-actions', {
  template: [
    '<div>',
      '<button class="ui red button" @click="itemAction(\'view-item\', rowData)"><i class="zoom icon"></i></button>',
      '<button class="ui blue button" @click="itemAction(\'edit-item\', rowData)"><i class="edit icon"></i></button>',
      '<button class="ui green button" @click="itemAction(\'delete-item\', rowData)"><i class="delete icon"></i></button>',
    '</div>'
  ].join(''),
  props: {
    rowData: {
      type: Object,
      required: true
    }
  },
  methods: {
    onClick: function(event) {
      console.log('actions: on-click', event.target)
    },
    onDoubleClick: function(event) {
      console.log('actions: on-dblclick', event.target)
    }
  }
})

Vue.component('my-detail-row', {
  template: [
    '<div @click="onClick">',
      '<div class="inline field">',
        '<label>Name: </label>',
        '<span>{{rowData.name}}</span>',
      '</div>',
      '<div class="inline field">',
        '<label>Email: </label>',
        '<span>{{rowData.email}}</span>',
      '</div>',
      '<div class="inline field">',
        '<label>Nickname: </label>',
        '<span>{{rowData.nickname}}</span>',
      '</div>',
      '<div class="inline field">',
        '<label>Birthdate: </label>',
        '<span>{{rowData.birthdate}}</span>',
      '</div>',
      '<div class="inline field">',
        '<label>Gender: </label>',
        '<span>{{rowData.gender}}</span>',
      '</div>',
    '</div>'
  ].join(''),
  props: {
    rowData: {
      type: Object,
      required: true
    }
  },
  methods: {
    onClick: function(event) {
      console.log('my-detail-row: on-click', event.target)
    }
  },
})


let tableColumns = [
    {
        name: 'id',
        title: '',
        dataClass: 'center aligned',
        callback: 'showDetailRow'
    },
    {
      name: 'name',
      title: 'Full Name',
      sortField: 'name'
    },
    {
        name: 'email',
        sortField: 'email',
        visible: true
    },
    {
        name: 'nickname',
        sortField: 'nickname',
        callback: 'allCap'
    },
    {
        name: 'birthdate',
        sortField: 'birthdate',
        callback: 'formatDate|D/MM/Y'
    },
    {
        name: 'gender',
        sortField: 'gender',
        titleClass: 'center aligned',
        dataClass: 'center aligned',
        callback: 'gender'
    },
    {
      name: '__component:custom-actions',
      dataClass: 'center aligned'
    }
]

let vm = new Vue({
  el: '#app',
  components: {
    Vuetable,
    VuetablePagination,
    VuetablePaginationDropdown,
    VuetablePaginationInfo,
  },
  data: {
    loading: '',
    searchFor: '',
    moreParams: {},
    fields: tableColumns,
    sortOrder: [{
        field: 'name',
        direction: 'asc',
    }],
    multiSort: true,
    paginationComponent: 'vuetable-pagination',
    perPage: 10,
    paginationInfoTemplate: 'Showing record: {from} to {to} from {total} item(s)',
  },
  watch: {
    'perPage' (val, oldVal) {
      this.$nextTick(function() {
        this.$refs.vuetable.refresh()
      })
    },
    'paginationComponent' (val, oldVal) {
      this.$nextTick(function() {
        this.$refs.pagination.setPaginationData(this.$refs.vuetable.tablePagination)
      })
    }
  },
  methods: {
    transform: function(data) {
      let transformed = []
      for (let i = 0; i < data.length; i++) {
        transformed.push({
          id: data[i].id,
          name: data[i].name,
          nickname: data[i].nickname,
          email: data[i].email,
          birthdate: data[i].birthdate,
          gender: data[i].gender,
          address: data[i].address.line1 + ' ' + data[i].address.line2 + ' ' + data[i].address.zipcode
        })
      }

      return transformed
    },
    showSettingsModal () {
      $('#settingsModal').modal({
        detachable: false,
        onVisible: function() {
          $('.ui.checkbox').checkbox()
        }
      }).modal('show')
    },
    showLoader: function() {
      this.loading = 'loading'
    },
    hideLoader: function() {
      this.loading = ''
    },
    getFieldTitle: function(field) {
      if (field.title !== '') return field.title

      if (field.name.slice(0, 2) === '__') {
        return field.name.indexOf(':') >= 0
          ? field.name.split(':')[1]
          : fiel.name.replace('__', '')
      }
    },
    allCap (value) {
      return value.toUpperCase()
    },
    formatDate (value, fmt) {
      if (value === null) return ''
      fmt = (typeof(fmt) === 'undefined') ? 'D MMM YYYY' : fmt
      return moment(value, 'YYYY-MM-DD').format(fmt)
    },
    gender (value) {
      return value === 'M'
        ? '<span class="ui teal label"><i class="male icon"></i>Male</span>'
        : '<span class="ui pink label"><i class="female icon"></i>Female</span>'
    },
    showDetailRow: function(value) {
      let icon = this.$refs.vuetable.isVisibleDetailRow(value) ? 'down' : 'right'
      return [
        '<a class="show-detail-row">',
            '<i class="chevron circle ' + icon + ' icon"></i>',
        '</a>'
      ].join('')
    },
    setFilter: function() {
      this.moreParams = {
        'filter': this.searchFor
      }
      this.$nextTick(function() {
        this.$refs.vuetable.refresh()
      })
    },
    resetFilter: function() {
      this.searchFor = ''
      this.setFilter()
    },
    preg_quote: function( str ) {
      // http://kevin.vanzonneveld.net
      // +   original by: booeyOH
      // +   improved by: Ates Goral (http://magnetiq.com)
      // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // +   bugfixed by: Onno Marsman
      // *     example 1: preg_quote("$40");
      // *     returns 1: '\$40'
      // *     example 2: preg_quote("*RRRING* Hello?");
      // *     returns 2: '\*RRRING\* Hello\?'
      // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
      // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'

      return (str+'').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
    },
    highlight: function(needle, haystack) {
      return haystack.replace(
        new RegExp('(' + this.preg_quote(needle) + ')', 'ig'),
        '<span class="highlight">$1</span>'
      )
    },
    rowClassCB: function(data, index) {
      return (index % 2) === 0 ? 'odd' : 'even'
    },
    onCellClicked (data, field, event) {
      console.log('cellClicked', field.name)
      if (field.name !== '__actions') {
        this.$refs.vuetable.toggleDetailRow(data.id)
      }
    },
    onCellDoubleClicked (data, field, event) {
      console.log('cellDoubleClicked:', field.name)
    },
    onActions (action, data) {
      console.log('actions: ', action, data.name)

      if (action === 'view-item') {
        sweetAlert(action, data.name)
      } else if (action === 'edit-item') {
        sweetAlert(action, data.name)
      } else if (action === 'delete-item') {
        sweetAlert(action, data.name)
      }
    },
    onLoadSuccess (response) {
      // set pagination data to pagination-info component
      this.$refs.paginationInfo.setPaginationData(response.data)

      let data = response.data.data
      if (this.searchFor !== '') {
        for (let n in data) {
          data[n].name = this.highlight(this.searchFor, data[n].name)
          data[n].email = this.highlight(this.searchFor, data[n].email)
        }
      }
    },
    onLoadError (response) {
      if (response.status == 400) {
        sweetAlert('Something\'s Wrong!', response.data.message, 'error')
      } else {
        sweetAlert('Oops', E_SERVER_ERROR, 'error')
      }
    },
    onPaginationData (tablePagination) {
      this.$refs.paginationInfo.setPaginationData(tablePagination)
      this.$refs.pagination.setPaginationData(tablePagination)
    },
    onChangePage (page) {
      this.$refs.vuetable.changePage(page)
    },
    registerEvents () {
      let self = this
      this.$on('vuetable:action', (action, data) => {
        self.onActions(action, data)
      })
      this.$on('vuetable:cell-clicked', (data, field, event) => {
        self.onCellClicked(data, field, event)
      })
      this.$on('vuetable:cell-dblclicked', (data, field, event) => {
        self.onCellDoubleClicked(data, field, event)
      })
      this.$on('vuetable:load-success', (response) => {
        self.onLoadSuccess(response)
      })
      this.$on('vuetable:load-error', (response) => {
        self.onLoadError(response)
      })
    }
  },
  created () {
    this.registerEvents()
  }
})
